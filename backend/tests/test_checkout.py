from decimal import Decimal

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from starlette.requests import Request

from app.api.deps import get_payment_provider
from app.core.config import settings
from app.core.limiter import get_user_id_or_ip
from app.main import app
from app.models.order import Order, OrderItem
from app.models.purchase import Purchase
from app.services import auth as auth_service
from app.services.payments import FakePaymentProvider

PASSWORD = "contrasena-larga-123"


def _loguear(client, email: str, password: str = PASSWORD) -> None:
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200


def _payload(course_ids: list[str]) -> dict:
    return {"items": [{"courseId": cid} for cid in course_ids]}


def _request_con_cookie(cookie_header: str | None, client_host: str = "127.0.0.1") -> Request:
    headers = []
    if cookie_header:
        headers.append((b"cookie", cookie_header.encode()))
    scope = {"type": "http", "headers": headers, "client": (client_host, 12345)}
    return Request(scope)


@pytest.fixture()
def provider() -> FakePaymentProvider:
    return FakePaymentProvider()


@pytest.fixture()
def client_checkout(client, provider):
    app.dependency_overrides[get_payment_provider] = lambda: provider
    yield client
    app.dependency_overrides.pop(get_payment_provider, None)


# --- Test obligatorio del roadmap (FASE-4.md 6.7) ---


def test_precio_manipulado_usa_el_precio_real_de_courses(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    crear_usuario(email="manip@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso(price=Decimal("1000.00"))
    _loguear(client_checkout, "manip@example.com")

    r = client_checkout.post(
        "/checkout", json={"items": [{"courseId": curso.id, "unitPrice": "1"}]}
    )

    assert r.status_code == 201
    assert r.json()["total"] == "1000.00"

    item = db.execute(
        select(OrderItem).where(OrderItem.order_id == r.json()["orderId"])
    ).scalar_one()
    assert item.unit_price == Decimal("1000.00")

    creaciones = [c for c in provider.calls if c["method"] == "create_preference"]
    assert creaciones[0]["items"][0].unit_price == Decimal("1000.00")


# --- require_verified_email: los dos tests espejo (FASE-4.md 6.3) ---


def test_sin_email_verificado_403(client_checkout, provider, crear_usuario, crear_curso):
    crear_usuario(email="noverificado@example.com", password=PASSWORD, verificado=False)
    curso = crear_curso()
    _loguear(client_checkout, "noverificado@example.com")

    r = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert r.status_code == 403


def test_con_email_verificado_201(client_checkout, provider, crear_usuario, crear_curso):
    crear_usuario(email="siverificado@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso()
    _loguear(client_checkout, "siverificado@example.com")

    r = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert r.status_code == 201


def test_sin_sesion_401(client_checkout, provider, crear_curso):
    curso = crear_curso()

    r = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert r.status_code == 401


# --- Forma exacta de la respuesta 201 ---


def test_forma_exacta_de_la_respuesta_201(client_checkout, provider, crear_usuario, crear_curso):
    crear_usuario(email="forma@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso(price=Decimal("1500.00"))
    _loguear(client_checkout, "forma@example.com")

    r = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert r.status_code == 201
    body = r.json()
    assert set(body.keys()) == {"orderId", "status", "total", "currency", "initPoint"}
    assert body["status"] == "pending"
    assert body["total"] == "1500.00"
    assert isinstance(body["total"], str)
    assert body["currency"] == "ARS"
    assert body["initPoint"] == f"https://fake.checkout/fake_pref_{body['orderId']}"


# --- 409: cursos ya comprados ---


def test_409_un_curso_ya_comprado(client_checkout, provider, crear_usuario, crear_curso, db):
    usuario = crear_usuario(email="yacomprado1@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso()
    db.add(Purchase(user_id=usuario.id, course_id=curso.id))
    db.commit()
    _loguear(client_checkout, "yacomprado1@example.com")

    r = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert r.status_code == 409
    assert r.json()["detail"] == {
        "code": "cursos_ya_comprados",
        "conflictingCourseIds": [curso.id],
    }


def test_409_dos_cursos_ya_comprados_de_tres(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    usuario = crear_usuario(email="yacomprado2@example.com", password=PASSWORD, verificado=True)
    curso_a = crear_curso(id="course_ya_a", title="Curso ya comprado A")
    curso_b = crear_curso(id="course_ya_b", title="Curso ya comprado B")
    curso_c = crear_curso(id="course_ya_c", title="Curso no comprado C")
    db.add(Purchase(user_id=usuario.id, course_id=curso_a.id))
    db.add(Purchase(user_id=usuario.id, course_id=curso_b.id))
    db.commit()
    _loguear(client_checkout, "yacomprado2@example.com")

    r = client_checkout.post(
        "/checkout", json=_payload([curso_a.id, curso_b.id, curso_c.id])
    )

    assert r.status_code == 409
    detail = r.json()["detail"]
    assert detail["code"] == "cursos_ya_comprados"
    assert set(detail["conflictingCourseIds"]) == {curso_a.id, curso_b.id}


def test_409_no_crea_ninguna_orden_ni_order_item(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    usuario = crear_usuario(email="yacomprado3@example.com", password=PASSWORD, verificado=True)
    curso_a = crear_curso(id="course_sinorden_a", title="A")
    curso_b = crear_curso(id="course_sinorden_b", title="B")
    curso_c = crear_curso(id="course_sinorden_c", title="C")
    db.add(Purchase(user_id=usuario.id, course_id=curso_a.id))
    db.commit()
    _loguear(client_checkout, "yacomprado3@example.com")

    r = client_checkout.post(
        "/checkout", json=_payload([curso_a.id, curso_b.id, curso_c.id])
    )

    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "cursos_ya_comprados"
    ordenes = db.execute(
        select(Order).where(Order.user_id == usuario.id)
    ).scalars().all()
    assert ordenes == []
    items = db.execute(
        select(OrderItem).where(OrderItem.course_id.in_([curso_a.id, curso_b.id, curso_c.id]))
    ).scalars().all()
    assert items == []


# --- 404: curso inactivo o inexistente ---


def test_curso_inactivo_404(client_checkout, provider, crear_usuario, crear_curso):
    crear_usuario(email="inactivo@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso(active=False)
    _loguear(client_checkout, "inactivo@example.com")

    r = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert r.status_code == 404
    assert r.json()["detail"] == {
        "code": "curso_no_disponible",
        "unavailableCourseIds": [curso.id],
    }


def test_curso_inexistente_404(client_checkout, provider, crear_usuario):
    crear_usuario(email="inexistente@example.com", password=PASSWORD, verificado=True)
    _loguear(client_checkout, "inexistente@example.com")

    r = client_checkout.post("/checkout", json=_payload(["course_que_no_existe"]))

    assert r.status_code == 404
    assert r.json()["detail"] == {
        "code": "curso_no_disponible",
        "unavailableCourseIds": ["course_que_no_existe"],
    }


# --- 400: carrito invalido ---


def test_carrito_vacio_400(client_checkout, provider, crear_usuario):
    crear_usuario(email="carritovacio@example.com", password=PASSWORD, verificado=True)
    _loguear(client_checkout, "carritovacio@example.com")

    r = client_checkout.post("/checkout", json={"items": []})

    assert r.status_code == 400
    assert r.json()["detail"] == {"code": "carrito_invalido"}


def test_course_id_repetido_400(client_checkout, provider, crear_usuario, crear_curso):
    crear_usuario(email="repetido@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso()
    _loguear(client_checkout, "repetido@example.com")

    r = client_checkout.post("/checkout", json=_payload([curso.id, curso.id]))

    assert r.status_code == 400
    assert r.json()["detail"] == {"code": "carrito_invalido"}


def test_21_items_400(client_checkout, provider, crear_usuario):
    crear_usuario(email="veintiuno@example.com", password=PASSWORD, verificado=True)
    _loguear(client_checkout, "veintiuno@example.com")

    ids = [f"course_falso_{i}" for i in range(21)]

    r = client_checkout.post("/checkout", json=_payload(ids))

    assert r.status_code == 400
    assert r.json()["detail"] == {"code": "carrito_invalido"}


# --- El indice parcial es la garantia real, no el codigo de checkout.py
# (espejo del par de tests de constraint en test_purchases.py) ---


def test_dos_ordenes_pending_del_mismo_usuario_rechazadas_por_constraint(
    db, crear_usuario
):
    usuario = crear_usuario(email="dospending@example.com", password=PASSWORD)

    db.add(
        Order(user_id=usuario.id, status="pending", total=Decimal("100.00"), currency="ARS")
    )
    db.commit()

    db.add(
        Order(user_id=usuario.id, status="pending", total=Decimal("200.00"), currency="ARS")
    )
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_orden_pending_y_orden_expired_del_mismo_usuario_conviven(db, crear_usuario):
    """Espejo del test anterior: una constraint mal escrita que rechace
    toda segunda orden (no solo una segunda pending) tambien haria
    fallar este test. El indice parcial solo restringe status='pending'.
    """
    usuario = crear_usuario(email="pendingyexpired@example.com", password=PASSWORD)

    db.add(
        Order(user_id=usuario.id, status="expired", total=Decimal("100.00"), currency="ARS")
    )
    db.add(
        Order(user_id=usuario.id, status="pending", total=Decimal("200.00"), currency="ARS")
    )
    db.commit()

    ordenes = db.execute(select(Order).where(Order.user_id == usuario.id)).scalars().all()
    assert len(ordenes) == 2


def test_carrera_dos_checkouts_del_mismo_usuario_devuelve_409_y_no_deja_orden_colgada(
    client_checkout, provider, crear_usuario, crear_curso, db, monkeypatch
):
    """Ejercita el except IntegrityError de crear_checkout de forma
    deterministica, sin dos requests concurrentes de verdad: el usuario
    SI tiene una orden pending en la base, pero se parchea la consulta
    que la busca (la unica que hace SELECT contra `orders` antes del
    INSERT) para que diga "no hay ninguna". El endpoint entonces intenta
    crear una segunda pending para el mismo usuario, choca contra
    uq_orders_una_pending_por_usuario al hacer flush() y cae al except.

    Mismo patron que test_registro_race_condition_toctou... en
    test_auth.py (F4-1): parchear el SELECT, no simular dos threads.
    """
    usuario = crear_usuario(email="carrera@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso()
    _loguear(client_checkout, "carrera@example.com")

    orden_vieja = Order(
        user_id=usuario.id, status="pending", total=Decimal("100.00"), currency="ARS"
    )
    db.add(orden_vieja)
    db.commit()

    original_execute = db.execute
    intercepto = {"listo": False}

    def _execute_sin_pending_previa(statement, *args, **kwargs):
        # La primera (y unica) consulta que hace SELECT contra `orders`
        # dentro de crear_checkout es la que busca la pending previa: la
        # de courses dice "FROM courses", la de purchases "FROM
        # purchases". Solo se intercepta la primera vez para no afectar
        # el INSERT del flush (que no pasa por aca) ni la consulta de
        # verificacion de mas abajo.
        if not intercepto["listo"] and "FROM orders" in str(statement):
            intercepto["listo"] = True

            class _SinFilas:
                def scalar_one_or_none(self) -> None:
                    return None

            return _SinFilas()
        return original_execute(statement, *args, **kwargs)

    monkeypatch.setattr(db, "execute", _execute_sin_pending_previa)

    r = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert intercepto["listo"], "el parche no engancho la consulta de la orden pending"
    assert r.status_code == 409
    assert r.json()["detail"] == {"code": "checkout_en_carrera"}

    monkeypatch.setattr(db, "execute", original_execute)
    pendientes = db.execute(
        select(Order).where(Order.user_id == usuario.id, Order.status == "pending")
    ).scalars().all()
    assert len(pendientes) == 1
    assert pendientes[0].id == orden_vieja.id


# --- Vencimiento y reemplazo (FASE-4.md 6.4) ---


def test_segundo_checkout_reemplaza_la_pending_al_precio_de_hoy(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    crear_usuario(email="reemplazo1@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso(price=Decimal("1000.00"))
    _loguear(client_checkout, "reemplazo1@example.com")

    r1 = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r1.status_code == 201
    orden1_id = r1.json()["orderId"]

    curso.price = Decimal("2000.00")
    db.commit()

    r2 = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r2.status_code == 201
    orden2_id = r2.json()["orderId"]
    assert r2.json()["total"] == "2000.00"

    orden1 = db.get(Order, orden1_id)
    assert orden1.status == "expired"

    pendientes = db.execute(
        select(Order).where(
            Order.user_id == orden1.user_id, Order.status == "pending"
        )
    ).scalars().all()
    assert len(pendientes) == 1
    assert pendientes[0].id == orden2_id


def test_reemplazo_llama_expire_preference_con_la_preferencia_vieja(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    crear_usuario(email="reemplazo2@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso()
    _loguear(client_checkout, "reemplazo2@example.com")

    r1 = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r1.status_code == 201
    orden1_id = r1.json()["orderId"]

    r2 = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r2.status_code == 201

    llamadas_expire = [c for c in provider.calls if c["method"] == "expire_preference"]
    assert len(llamadas_expire) == 1
    assert llamadas_expire[0]["preference_id"] == f"fake_pref_{orden1_id}"


def test_reemplazo_con_fail_expire_igual_devuelve_201_y_pending(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    crear_usuario(email="reemplazo3@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso()
    _loguear(client_checkout, "reemplazo3@example.com")

    r1 = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r1.status_code == 201

    provider.fail_expire = True
    r2 = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert r2.status_code == 201
    orden2 = db.get(Order, r2.json()["orderId"])
    assert orden2.status == "pending"


# --- Falla del proveedor de pago ---


def test_falla_del_proveedor_502_orden_queda_expired(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    usuario = crear_usuario(email="fallacreate@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso()
    _loguear(client_checkout, "fallacreate@example.com")
    provider.fail_create = True

    r = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert r.status_code == 502
    assert r.json()["detail"] == {"code": "proveedor_no_disponible"}
    ordenes = db.execute(
        select(Order).where(Order.user_id == usuario.id)
    ).scalars().all()
    assert len(ordenes) == 1
    assert ordenes[0].status == "expired"


def test_falla_create_durante_reemplazo_deja_cero_pending(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    usuario = crear_usuario(email="fallareemplazo@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso()
    _loguear(client_checkout, "fallareemplazo@example.com")

    r1 = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r1.status_code == 201

    provider.fail_create = True
    r2 = client_checkout.post("/checkout", json=_payload([curso.id]))

    assert r2.status_code == 502
    assert r2.json()["detail"] == {"code": "proveedor_no_disponible"}
    ordenes = db.execute(
        select(Order).where(Order.user_id == usuario.id)
    ).scalars().all()
    assert len(ordenes) == 2
    assert {orden.status for orden in ordenes} == {"expired"}


# --- Snapshot de precio y titulo ---


def test_snapshot_de_precio_no_cambia_si_el_curso_cambia_despues(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    crear_usuario(email="snapshotprecio@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso(price=Decimal("1000.00"))
    _loguear(client_checkout, "snapshotprecio@example.com")

    r = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r.status_code == 201

    curso.price = Decimal("5000.00")
    db.commit()

    item = db.execute(
        select(OrderItem).where(OrderItem.order_id == r.json()["orderId"])
    ).scalar_one()
    assert item.unit_price == Decimal("1000.00")


def test_snapshot_de_titulo_no_cambia_si_el_curso_cambia_despues(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    crear_usuario(email="snapshottitulo@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso(title="Titulo original")
    _loguear(client_checkout, "snapshottitulo@example.com")

    r = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r.status_code == 201

    curso.title = "Titulo cambiado despues"
    db.commit()

    item = db.execute(
        select(OrderItem).where(OrderItem.order_id == r.json()["orderId"])
    ).scalar_one()
    assert item.title == "Titulo original"


# --- cancellation_code ---


def test_cancellation_code_no_nulo_y_distinto_entre_ordenes(
    client_checkout, provider, crear_usuario, crear_curso, db
):
    crear_usuario(email="cancel1@example.com", password=PASSWORD, verificado=True)
    crear_usuario(email="cancel2@example.com", password=PASSWORD, verificado=True)
    curso = crear_curso()

    _loguear(client_checkout, "cancel1@example.com")
    r1 = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r1.status_code == 201

    client_checkout.post("/auth/logout")
    _loguear(client_checkout, "cancel2@example.com")
    r2 = client_checkout.post("/checkout", json=_payload([curso.id]))
    assert r2.status_code == 201

    orden1 = db.get(Order, r1.json()["orderId"])
    orden2 = db.get(Order, r2.json()["orderId"])
    assert orden1.cancellation_code is not None
    assert orden2.cancellation_code is not None
    assert orden1.cancellation_code != orden2.cancellation_code


# --- Key function del rate limit por usuario ---


def test_key_function_extrae_el_user_id_de_la_sesion(monkeypatch, db, crear_usuario):
    """El limiter corre apagado en toda la suite (fixture
    _sin_rate_limit), asi que ningun test HTTP ejercita esta funcion.
    Se prueba directo, sin pasar por el endpoint.
    """
    from app.core import limiter as limiter_module

    monkeypatch.setattr(limiter_module, "SessionLocal", lambda: db)
    usuario = crear_usuario(email="keyfunc@example.com", password=PASSWORD, verificado=True)
    token = auth_service.create_session(db, usuario)
    db.commit()

    request = _request_con_cookie(f"{settings.session_cookie_name}={token}")

    assert get_user_id_or_ip(request) == f"user:{usuario.id}"


def test_key_function_cae_a_la_ip_sin_sesion_valida(monkeypatch, db):
    from app.core import limiter as limiter_module

    monkeypatch.setattr(limiter_module, "SessionLocal", lambda: db)

    request = _request_con_cookie(None, client_host="203.0.113.5")

    assert get_user_id_or_ip(request) == "203.0.113.5"
