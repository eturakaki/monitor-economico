"""Instancia compartida de Limiter.

Vive en su propio modulo (y no en main.py) para que main.py y los
routers puedan importarla sin depender uno del otro.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
