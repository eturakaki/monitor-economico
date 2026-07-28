from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select

from app.core.config import settings
from app.core.security import hash_token
from app.models.auth_event import AuthEvent
from app.models.auth_token import AuthToken
from app.services import auth as auth_service

# --- OBLIGATORIOS: sello de la fase 3 --------------------------------

def test_login_con_password_correcta_devuelve_200_y_cookie(client, crear_usuario):
    crear_usuario(email="ana@example.com", password="contrasena-larga-123")

    r = client.post(
        "/auth/login",
        json={"email": "ana@example.com", "password": "contrasena-larga-123"},
    )

    assert r.status_code == 200
    assert settings.session_cookie_name in r.cookies, (
        "el login debe setear la cookie de sesion, no solo devolver 200"
    )


def test_login_con_password_incorrecta_devuelve_401(client, crear_usuario):
    crear_usuario(email="ana@example.com", password="contrasena-larga-123")

    r = client.post(
        "/auth/login",
        json={"email": "ana@example.com", "password": "otra-password-999"},
    )

    assert r.status_code == 401


def test_me_sin_cookie_devuelve_401(client):
    r = client.get("/auth/me")

    assert r.status_code == 401


def test_solo_unlimited_con_plan_starter_devuelve_403(client, crear_usuario):
    crear_usuario(email="ana@example.com", password="contrasena-larga-123", plan="starter")
    client.post(
        "/auth/login",
        json={"email": "ana@example.com", "password": "contrasena-larga-123"},
    )

    r = client.get("/_test/solo-unlimited")

    assert r.status_code == 403


# --- Adicionales --------------------------------------------------------

def test_registro_exitoso_devuelve_201_y_claves_camelcase(client):
    r = client.post(
        "/auth/register",
        json={
            "email": "nueva@example.com",
            "name": "Nueva Usuaria",
            "password": "contrasena-larga-123",
            "acceptedTerms": True,
        },
    )

    assert r.status_code == 201
    claves_esperadas = {
        "id", "email", "name", "plan", "role", "emailVerified",
        "purchasedCourses", "completedLessons", "lastActivity", "createdAt",
    }
    assert set(r.json().keys()) == claves_esperadas


def test_registro_con_email_existente_devuelve_409(client, crear_usuario):
    crear_usuario(email="dup@example.com")

    r = client.post(
        "/auth/register",
        json={
            "email": "dup@example.com",
            "name": "Otra Usuaria",
            "password": "contrasena-larga-123",
            "acceptedTerms": True,
        },
    )

    assert r.status_code == 409


def test_registro_con_password_corta_devuelve_422(client):
    r = client.post(
        "/auth/register",
        json={
            "email": "corta@example.com",
            "name": "Password Corta",
            "password": "corta1234",
            "acceptedTerms": True,
        },
    )

    assert r.status_code == 422


def test_registro_con_terminos_no_aceptados_devuelve_422(client):
    r = client.post(
        "/auth/register",
        json={
            "email": "sinterminos@example.com",
            "name": "Sin Terminos",
            "password": "contrasena-larga-123",
            "acceptedTerms": False,
        },
    )

    assert r.status_code == 422


def test_registro_con_email_en_mayusculas_lo_guarda_en_minusculas(client):
    r = client.post(
        "/auth/register",
        json={
            "email": "MAYUSCULA@Example.com",
            "name": "Mayuscula",
            "password": "contrasena-larga-123",
            "acceptedTerms": True,
        },
    )

    assert r.status_code == 201
    assert r.json()["email"] == "mayuscula@example.com"


def test_login_con_email_inexistente_devuelve_401_mismo_mensaje_que_password_incorrecta(
    client, crear_usuario
):
    crear_usuario(email="existe@example.com", password="contrasena-larga-123")

    r_password_incorrecta = client.post(
        "/auth/login",
        json={"email": "existe@example.com", "password": "password-mala-999"},
    )
    r_email_inexistente = client.post(
        "/auth/login",
        json={"email": "noexiste@example.com", "password": "cualquier-cosa-123"},
    )

    assert r_password_incorrecta.status_code == 401
    assert r_email_inexistente.status_code == 401
    assert r_password_incorrecta.json()["detail"] == r_email_inexistente.json()["detail"]


def test_logout_despues_un_get_me_devuelve_401(client, crear_usuario):
    crear_usuario(email="logout@example.com", password="contrasena-larga-123")
    client.post(
        "/auth/login",
        json={"email": "logout@example.com", "password": "contrasena-larga-123"},
    )
    assert client.get("/auth/me").status_code == 200

    r_logout = client.post("/auth/logout")
    assert r_logout.status_code == 200

    r_me = client.get("/auth/me")
    assert r_me.status_code == 401


def test_admin_con_plan_starter_si_entra_a_solo_unlimited(client, crear_usuario):
    crear_usuario(
        email="admin@example.com", password="contrasena-larga-123",
        plan="starter", role="admin",
    )
    client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "contrasena-larga-123"},
    )

    r = client.get("/_test/solo-unlimited")

    assert r.status_code == 200


def test_plan_unlimited_entra_a_solo_unlimited(client, crear_usuario):
    """Caso positivo que faltaba: la suite ya probaba que el porton
    cierra (plan starter -> 403) pero nunca que abre. Un require_plan
    roto que devolviera 403 siempre pasaria los tests negativos sin que
    nadie se entere.
    """
    crear_usuario(
        email="unlimited@example.com", password="contrasena-larga-123",
        plan="unlimited",
    )
    client.post(
        "/auth/login",
        json={"email": "unlimited@example.com", "password": "contrasena-larga-123"},
    )

    r = client.get("/_test/solo-unlimited")

    assert r.status_code == 200


def test_plan_pro_no_entra_a_solo_unlimited_porque_la_semantica_es_pertenencia_no_jerarquia(
    client, crear_usuario
):
    """require_plan hace 'user.plan not in plans': pertenencia exacta
    contra la tupla de planes pasada, sin ningun orden ni tabla de
    niveles. require_plan("unlimited") NO deja pasar a "pro", aunque en
    el negocio "pro" sea un plan pago intermedio.

    Si algun dia alguien cambia require_plan para que sea jerarquico
    (donde exigir "unlimited" tambien dejara pasar planes "mayores", o
    donde "pro" cuente como suficiente para algo que pide un nivel
    menor), este test va a fallar. Ese fallo es la señal correcta de que
    la semantica cambio, no un bug de este test — hay que revisarlo a
    proposito en ese momento, no arreglarlo a ciegas para que vuelva a
    pasar.
    """
    crear_usuario(
        email="pro@example.com", password="contrasena-larga-123", plan="pro",
    )
    client.post(
        "/auth/login",
        json={"email": "pro@example.com", "password": "contrasena-larga-123"},
    )

    r = client.get("/_test/solo-unlimited")

    assert r.status_code == 403


def test_solo_verificado_403_sin_verificar_y_200_verificado(client, crear_usuario):
    crear_usuario(
        email="sinverificar@example.com", password="contrasena-larga-123",
        verificado=False,
    )
    client.post(
        "/auth/login",
        json={"email": "sinverificar@example.com", "password": "contrasena-larga-123"},
    )
    r_sin_verificar = client.get("/_test/solo-verificado")
    assert r_sin_verificar.status_code == 403
    client.post("/auth/logout")

    crear_usuario(
        email="verificada@example.com", password="contrasena-larga-123",
        verificado=True,
    )
    client.post(
        "/auth/login",
        json={"email": "verificada@example.com", "password": "contrasena-larga-123"},
    )
    r_verificada = client.get("/_test/solo-verificado")
    assert r_verificada.status_code == 200


def test_login_fallido_deja_fila_en_auth_events(client, crear_usuario, db):
    crear_usuario(email="evento@example.com", password="contrasena-larga-123")

    client.post(
        "/auth/login",
        json={"email": "evento@example.com", "password": "password-incorrecta-1"},
    )

    evento = db.execute(
        select(AuthEvent).where(
            AuthEvent.event_type == "login_failed",
            AuthEvent.email_attempted == "evento@example.com",
        )
    ).scalar_one_or_none()
    assert evento is not None, "el login fallido debe dejar una fila en auth_events"


# --- /auth/verify: cierra el pre-hijacking ------------------------------

def test_verificacion_get_devuelve_200_y_no_consume_el_token(client, crear_usuario, db):
    user = crear_usuario(email="verificar1@example.com", password="contrasena-larga-123")
    token = auth_service.create_auth_token(db, user, purpose="email_verification")
    db.commit()

    r_get = client.get(f"/auth/verify?token={token}")
    assert r_get.status_code == 200

    r_post = client.post("/auth/verify", data={"token": token})
    assert r_post.status_code == 200, (
        "el GET no debe haber consumido el token: el POST posterior tiene que funcionar"
    )


def test_verificacion_post_con_token_valido_marca_email_verified_at(client, crear_usuario, db):
    user = crear_usuario(email="verificar2@example.com", password="contrasena-larga-123")
    token = auth_service.create_auth_token(db, user, purpose="email_verification")
    db.commit()

    r = client.post("/auth/verify", data={"token": token})

    assert r.status_code == 200
    db.refresh(user)
    assert user.email_verified_at is not None


def test_verificacion_con_el_mismo_token_dos_veces_la_segunda_falla(client, crear_usuario, db):
    user = crear_usuario(email="verificar3@example.com", password="contrasena-larga-123")
    token = auth_service.create_auth_token(db, user, purpose="email_verification")
    db.commit()

    r1 = client.post("/auth/verify", data={"token": token})
    r2 = client.post("/auth/verify", data={"token": token})

    assert r1.status_code == 200
    assert r2.status_code == 400


def test_verificacion_revoca_sesiones_previas_y_cierra_el_pre_hijacking(client, crear_usuario, db):
    user = crear_usuario(email="verificar4@example.com", password="contrasena-larga-123")
    r_login = client.post(
        "/auth/login",
        json={"email": "verificar4@example.com", "password": "contrasena-larga-123"},
    )
    assert r_login.status_code == 200
    assert client.get("/auth/me").status_code == 200

    token = auth_service.create_auth_token(db, user, purpose="email_verification")
    db.commit()

    r_verify = client.post("/auth/verify", data={"token": token})
    assert r_verify.status_code == 200

    r_me = client.get("/auth/me")
    assert r_me.status_code == 401, (
        "verificar el email debe revocar la sesion que dejo el atacante (pre-hijacking)"
    )


def test_verificacion_desde_cliente_sin_cookie_funciona_igual(client, crear_usuario, db):
    """El fixture `client` arranca sin cookies (no hay login previo en este
    test): simula abrir el link del mail en un navegador o dispositivo
    distinto del que hizo el registro. Tiene que verificar igual y no
    romper al intentar borrar una cookie de sesion que nunca existio.
    """
    user = crear_usuario(email="verificar5@example.com", password="contrasena-larga-123")
    token = auth_service.create_auth_token(db, user, purpose="email_verification")
    db.commit()

    r = client.post("/auth/verify", data={"token": token})

    assert r.status_code == 200
    db.refresh(user)
    assert user.email_verified_at is not None


def test_verificacion_get_con_token_malicioso_no_aparece_sin_escapar(client):
    token_malicioso = '"><script>alert(1)</script>'

    r = client.get("/auth/verify", params={"token": token_malicioso})

    assert r.status_code == 400, (
        "el regex de formato ya lo rechaza: es la primera de las dos defensas contra XSS"
    )
    assert "<script>" not in r.text
    assert token_malicioso not in r.text


def test_verificacion_con_token_vencido_falla(client, crear_usuario, db):
    user = crear_usuario(email="verificar6@example.com", password="contrasena-larga-123")
    token = auth_service.create_auth_token(db, user, purpose="email_verification")
    db.commit()

    auth_token_row = db.execute(
        select(AuthToken).where(AuthToken.token_hash == hash_token(token))
    ).scalar_one()
    auth_token_row.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    db.commit()

    r = client.post("/auth/verify", data={"token": token})

    assert r.status_code == 400


# --- /auth/recovery, /auth/reset, /auth/verify/resend -------------------

def test_recovery_con_email_existente_devuelve_202_y_crea_un_token(client, crear_usuario, db):
    user = crear_usuario(email="recovery1@example.com", password="contrasena-larga-123")

    r = client.post("/auth/recovery", json={"email": "recovery1@example.com"})

    assert r.status_code == 202
    tokens = db.execute(
        select(AuthToken).where(
            AuthToken.user_id == user.id, AuthToken.purpose == "password_reset"
        )
    ).scalars().all()
    assert len(tokens) == 1


def test_recovery_con_email_inexistente_devuelve_202_y_no_crea_ningun_token(client, db):
    r = client.post("/auth/recovery", json={"email": "no-existe-recovery@example.com"})

    assert r.status_code == 202
    tokens = db.execute(select(AuthToken)).scalars().all()
    assert tokens == []


def test_recovery_cuerpos_de_respuesta_son_identicos_exista_o_no_la_cuenta(
    client, crear_usuario
):
    crear_usuario(email="recovery3@example.com", password="contrasena-larga-123")

    r_existente = client.post("/auth/recovery", json={"email": "recovery3@example.com"})
    r_inexistente = client.post(
        "/auth/recovery", json={"email": "no-existe-3@example.com"}
    )

    assert r_existente.status_code == 202
    assert r_inexistente.status_code == 202
    assert r_existente.json() == r_inexistente.json()


def test_pedir_recovery_dos_veces_invalida_el_token_anterior(client, crear_usuario, db):
    user = crear_usuario(email="recovery4@example.com", password="contrasena-larga-123")

    primer_token = auth_service.create_auth_token(db, user, purpose="password_reset")
    db.commit()

    r = client.post("/auth/recovery", json={"email": "recovery4@example.com"})
    assert r.status_code == 202

    resultado = auth_service.consume_auth_token(db, primer_token, purpose="password_reset")
    assert resultado is None, "el segundo pedido de recovery debia invalidar el primer token"


def test_cuarto_pedido_de_recovery_en_la_misma_hora_no_crea_token_nuevo(
    client, crear_usuario, db
):
    user = crear_usuario(email="recovery14@example.com", password="contrasena-larga-123")

    def _cantidad_tokens() -> int:
        return db.execute(
            select(func.count())
            .select_from(AuthToken)
            .where(AuthToken.user_id == user.id, AuthToken.purpose == "password_reset")
        ).scalar_one()

    for _ in range(3):
        r = client.post("/auth/recovery", json={"email": "recovery14@example.com"})
        assert r.status_code == 202

    assert _cantidad_tokens() == 3

    r4 = client.post("/auth/recovery", json={"email": "recovery14@example.com"})
    assert r4.status_code == 202
    assert _cantidad_tokens() == 3, "el cuarto pedido en la misma hora no debia crear un token nuevo"


def test_cuarto_pedido_de_recovery_igual_devuelve_202_con_mismo_cuerpo(client, crear_usuario):
    crear_usuario(email="recovery15@example.com", password="contrasena-larga-123")

    respuestas = [
        client.post("/auth/recovery", json={"email": "recovery15@example.com"})
        for _ in range(4)
    ]

    for r in respuestas:
        assert r.status_code == 202
    cuerpos = {r.json()["detail"] for r in respuestas}
    assert len(cuerpos) == 1, "el cuerpo debe ser identico aunque el rate limit por cuenta actue"


def test_reset_get_no_consume_el_token(client, crear_usuario, db):
    user = crear_usuario(email="reset5@example.com", password="contrasena-larga-123")
    token = auth_service.create_auth_token(db, user, purpose="password_reset")
    db.commit()

    r_get = client.get(f"/auth/reset?token={token}")
    assert r_get.status_code == 200

    r_post = client.post(
        "/auth/reset",
        data={
            "token": token,
            "password_nueva": "nueva-contrasena-456",
            "password_repetida": "nueva-contrasena-456",
        },
    )
    assert r_post.status_code == 200, "el GET no debia haber consumido el token"


def test_despues_del_reset_password_vieja_401_y_nueva_200(client, crear_usuario, db):
    user = crear_usuario(email="reset6@example.com", password="contrasena-vieja-123")
    token = auth_service.create_auth_token(db, user, purpose="password_reset")
    db.commit()

    r = client.post(
        "/auth/reset",
        data={
            "token": token,
            "password_nueva": "contrasena-nueva-456",
            "password_repetida": "contrasena-nueva-456",
        },
    )
    assert r.status_code == 200

    r_vieja = client.post(
        "/auth/login",
        json={"email": "reset6@example.com", "password": "contrasena-vieja-123"},
    )
    assert r_vieja.status_code == 401

    r_nueva = client.post(
        "/auth/login",
        json={"email": "reset6@example.com", "password": "contrasena-nueva-456"},
    )
    assert r_nueva.status_code == 200


def test_reset_revoca_las_sesiones_previas(client, crear_usuario, db):
    user = crear_usuario(email="reset7@example.com", password="contrasena-vieja-123")
    client.post(
        "/auth/login",
        json={"email": "reset7@example.com", "password": "contrasena-vieja-123"},
    )
    assert client.get("/auth/me").status_code == 200

    token = auth_service.create_auth_token(db, user, purpose="password_reset")
    db.commit()

    r = client.post(
        "/auth/reset",
        data={
            "token": token,
            "password_nueva": "contrasena-nueva-456",
            "password_repetida": "contrasena-nueva-456",
        },
    )
    assert r.status_code == 200

    r_me = client.get("/auth/me")
    assert r_me.status_code == 401


def test_reset_marca_email_verified_at_si_estaba_en_null(client, crear_usuario, db):
    user = crear_usuario(
        email="reset8@example.com", password="contrasena-vieja-123", verificado=False
    )
    assert user.email_verified_at is None

    token = auth_service.create_auth_token(db, user, purpose="password_reset")
    db.commit()

    r = client.post(
        "/auth/reset",
        data={
            "token": token,
            "password_nueva": "contrasena-nueva-456",
            "password_repetida": "contrasena-nueva-456",
        },
    )
    assert r.status_code == 200

    db.refresh(user)
    assert user.email_verified_at is not None


def test_token_de_email_verification_no_sirve_para_resetear_password(
    client, crear_usuario, db
):
    user = crear_usuario(email="reset9@example.com", password="contrasena-vieja-123")
    token = auth_service.create_auth_token(db, user, purpose="email_verification")
    db.commit()

    r = client.post(
        "/auth/reset",
        data={
            "token": token,
            "password_nueva": "contrasena-nueva-456",
            "password_repetida": "contrasena-nueva-456",
        },
    )
    assert r.status_code == 400


def test_reset_con_passwords_distintas_falla_y_no_consume_el_token(
    client, crear_usuario, db
):
    user = crear_usuario(email="reset10@example.com", password="contrasena-vieja-123")
    token = auth_service.create_auth_token(db, user, purpose="password_reset")
    db.commit()

    r = client.post(
        "/auth/reset",
        data={
            "token": token,
            "password_nueva": "contrasena-nueva-456",
            "password_repetida": "otra-cosa-distinta-789",
        },
    )
    assert r.status_code == 400

    r2 = client.post(
        "/auth/reset",
        data={
            "token": token,
            "password_nueva": "contrasena-nueva-456",
            "password_repetida": "contrasena-nueva-456",
        },
    )
    assert r2.status_code == 200, "el token debia seguir sirviendo tras el intento fallido"


def test_reset_con_token_vencido_falla(client, crear_usuario, db):
    user = crear_usuario(email="reset11@example.com", password="contrasena-vieja-123")
    token = auth_service.create_auth_token(db, user, purpose="password_reset")
    db.commit()

    token_row = db.execute(
        select(AuthToken).where(AuthToken.token_hash == hash_token(token))
    ).scalar_one()
    token_row.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    db.commit()

    r = client.post(
        "/auth/reset",
        data={
            "token": token,
            "password_nueva": "contrasena-nueva-456",
            "password_repetida": "contrasena-nueva-456",
        },
    )
    assert r.status_code == 400


def test_resend_sin_sesion_devuelve_401(client):
    r = client.post("/auth/verify/resend")

    assert r.status_code == 401


def test_resend_de_usuario_ya_verificado_es_rechazado(client, crear_usuario):
    crear_usuario(
        email="resend13@example.com", password="contrasena-larga-123", verificado=True
    )
    client.post(
        "/auth/login",
        json={"email": "resend13@example.com", "password": "contrasena-larga-123"},
    )

    r = client.post("/auth/verify/resend")

    assert r.status_code == 400


def test_resend_deja_una_fila_email_verification_resent_en_auth_events(
    client, crear_usuario, db
):
    user = crear_usuario(
        email="resend14@example.com", password="contrasena-larga-123", verificado=False
    )
    client.post(
        "/auth/login",
        json={"email": "resend14@example.com", "password": "contrasena-larga-123"},
    )

    r = client.post("/auth/verify/resend")

    assert r.status_code == 200
    evento = db.execute(
        select(AuthEvent).where(
            AuthEvent.user_id == user.id,
            AuthEvent.event_type == "email_verification_resent",
        )
    ).scalar_one_or_none()
    assert evento is not None
