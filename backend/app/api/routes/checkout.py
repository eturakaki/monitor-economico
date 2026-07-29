import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_payment_provider, require_verified_email
from app.core.config import settings
from app.core.limiter import get_user_id_or_ip, limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.order import CheckoutIn, CheckoutOut
from app.services import checkout as checkout_service
from app.services.payments import PaymentProvider, PaymentProviderError, PreferenceItem

router = APIRouter(tags=["checkout"])
logger = logging.getLogger(__name__)


@router.post("/checkout", response_model=CheckoutOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/hour", key_func=get_user_id_or_ip)
def crear_checkout(
    request: Request,
    datos: CheckoutIn,
    user: User = Depends(require_verified_email),
    db: Session = Depends(get_db),
    provider: PaymentProvider = Depends(get_payment_provider),
) -> CheckoutOut:
    course_ids = [item.course_id for item in datos.items]

    try:
        resultado = checkout_service.crear_checkout(
            db, user=user, course_ids=course_ids
        )
    except checkout_service.CarritoInvalidoError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "carrito_invalido"},
        ) from exc
    except checkout_service.CursoNoDisponibleError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "curso_no_disponible",
                "unavailableCourseIds": exc.course_ids,
            },
        ) from exc
    except checkout_service.CursosYaCompradosError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "cursos_ya_comprados",
                "conflictingCourseIds": exc.course_ids,
            },
        ) from exc
    except checkout_service.CheckoutEnCarreraError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "checkout_en_carrera"},
        ) from exc

    orden = resultado.orden

    # Reemplazo: anular la preferencia vieja ANTES de crear la nueva. Al
    # reves, si create_preference fallara, la vieja quedaria sin anular
    # y su link seguiria vivo con el precio viejo (el mismo agujero que
    # el vencimiento de 24hs vino a cerrar).
    if resultado.preferencia_a_anular is not None:
        try:
            provider.expire_preference(resultado.preferencia_a_anular)
        except PaymentProviderError:
            # Best-effort: la correccion real vive en la politica del
            # webhook de F4-5 (FASE-4.md 6.4/6.5), esto es higiene.
            logger.warning(
                "No se pudo anular la preferencia %s al reemplazar la orden",
                resultado.preferencia_a_anular,
            )

    expires_at = datetime.now(timezone.utc) + timedelta(
        hours=settings.checkout_preference_ttl_hours
    )
    items_preferencia = [
        PreferenceItem(
            course_id=item.course_id, title=item.title, unit_price=item.unit_price
        )
        for item in orden.items
    ]

    try:
        preferencia = provider.create_preference(
            order_id=orden.id, items=items_preferencia, expires_at=expires_at
        )
    except PaymentProviderError:
        # Una orden pending sin link de pago es un estado que miente y
        # bloquearia el indice parcial sin representar nada: se expira.
        orden.status = "expired"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": "proveedor_no_disponible"},
        ) from None

    orden.provider_preference_id = preferencia.preference_id
    db.commit()

    return CheckoutOut(
        order_id=orden.id,
        status=orden.status,
        total=orden.total,
        currency=orden.currency,
        init_point=preferencia.init_point,
    )
