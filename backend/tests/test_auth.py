from sqlalchemy import select

from app.core.config import settings
from app.models.auth_event import AuthEvent

# --- OBLIGATORIOS: sello de la fase 3 --------------------------------

def test_login_con_password_correcta_devuelve_200_y_cookie(client, crear_usuario):
    crear_usuario(email="ana@example.com", password="contrasena-larga-123")

    r = client.post(
        "/auth/login",
        json={"email": "ana@example.com", "password": "contrasena-larga-123"},
    )

    assert r.status_code == 418
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
