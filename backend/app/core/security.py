"""Primitivas criptograficas de autenticacion: passwords y tokens.

Usan dos esquemas distintos a proposito. El token (de sesion, de
verificacion de email, de reset de password) se genera con
secrets.token_urlsafe(32): ya tiene 256 bits de entropia aleatoria y no
admite ataque de diccionario, asi que hashearlo con un algoritmo lento
como Argon2 solo agregaria latencia en cada request sin sumar
seguridad; alcanza con SHA-256, que es rapido y suficiente para no
guardar el valor en claro en la base. La password, en cambio, la elige
un humano y suele tener poca entropia real, por eso necesita un hash
lento y costoso a proposito (Argon2id) que haga inviable probar
combinaciones por fuerza bruta.
"""

import hashlib
import secrets

from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError

MIN_PASSWORD_LENGTH = 12
MAX_PASSWORD_LENGTH = 128

_password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Genera el hash Argon2id de una password."""
    return _password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verifica una password contra su hash.

    Devuelve False (en vez de propagar la excepcion) si el hash
    almacenado esta corrupto o tiene un formato desconocido.
    """
    try:
        return _password_hash.verify(password, hashed)
    except UnknownHashError:
        return False


def generate_token() -> str:
    """Genera un token aleatorio de un solo uso.

    Es el valor que viaja en la cookie de sesion o en el link del mail
    (verificacion de email, reset de password).
    """
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Hashea un token para guardarlo en la base.

    En la base nunca se guarda el token en claro, solo este hash.
    """
    return hashlib.sha256(token.encode()).hexdigest()
