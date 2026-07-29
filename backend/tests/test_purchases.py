from decimal import Decimal

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models.course import Course
from app.models.purchase import Purchase


def test_compra_duplicada_del_mismo_curso_rechazada_por_constraint(
    db, crear_usuario, crear_curso
):
    usuario = crear_usuario(email="compra1@example.com")
    curso = crear_curso()

    db.add(Purchase(user_id=usuario.id, course_id=curso.id))
    db.commit()

    db.add(Purchase(user_id=usuario.id, course_id=curso.id))
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_mismo_usuario_compra_un_segundo_curso_distinto_permitido(
    db, crear_usuario, crear_curso
):
    """Espejo del test anterior: una constraint mal escrita que rechace
    toda compra (no solo la repetida) tambien haria fallar este test.
    """
    usuario = crear_usuario(email="compra2@example.com")
    curso_uno = crear_curso(id="course_test_uno", title="Curso de prueba uno")
    curso_dos = crear_curso(id="course_test_dos", title="Curso de prueba dos")

    db.add(Purchase(user_id=usuario.id, course_id=curso_uno.id))
    db.add(Purchase(user_id=usuario.id, course_id=curso_dos.id))
    db.commit()

    compras = db.execute(
        select(Purchase).where(Purchase.user_id == usuario.id)
    ).scalars().all()
    assert len(compras) == 2


def test_me_con_compras_devuelve_los_ids_correctos(client, crear_usuario, crear_curso, db):
    usuario = crear_usuario(email="compra3@example.com", password="contrasena-larga-123")
    curso = crear_curso(id="course_test_tres", title="Curso de prueba tres")
    db.add(Purchase(user_id=usuario.id, course_id=curso.id))
    db.commit()

    client.post(
        "/auth/login",
        json={"email": "compra3@example.com", "password": "contrasena-larga-123"},
    )
    r = client.get("/auth/me")

    assert r.status_code == 200
    assert r.json()["purchasedCourses"] == [curso.id]


def test_me_sin_compras_devuelve_lista_vacia(client, crear_usuario):
    """Espejo del test anterior: sin compras, el contrato sigue siendo
    un array (vacio), nunca null ni un error.
    """
    crear_usuario(email="compra4@example.com", password="contrasena-larga-123")

    client.post(
        "/auth/login",
        json={"email": "compra4@example.com", "password": "contrasena-larga-123"},
    )
    r = client.get("/auth/me")

    assert r.status_code == 200
    assert r.json()["purchasedCourses"] == []


def test_price_leido_de_la_base_es_decimal_no_float(db, crear_curso):
    curso = crear_curso(price=Decimal("4500.50"))

    db.expire(curso)
    recargado = db.execute(select(Course).where(Course.id == curso.id)).scalar_one()

    assert isinstance(recargado.price, Decimal)
