from datetime import datetime, timedelta, timezone

from sqlalchemy import select

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
