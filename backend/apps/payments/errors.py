from rest_framework import status
from rest_framework.response import Response

from apps.payments.providers.base import PaymentProviderError


def payment_provider_error_response(exc: PaymentProviderError, *, log_event: str, **log_kwargs) -> Response:
    """Return a safe client-facing payment error; never leak provider/config internals."""
    import logging

    logger = logging.getLogger('ummah_tech_fest')
    logger.warning('%s err=%s', log_event, exc, extra=log_kwargs)

    return Response(
        {
            'error': {
                'code': exc.code,
                'message': exc.user_message,
            },
        },
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )
