import logging
from django.core.exceptions import PermissionDenied
from django.db import DatabaseError, IntegrityError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException, AuthenticationFailed, NotAuthenticated, Throttled, ValidationError
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger('ummah_tech_fest')
security_logger = logging.getLogger('security')

GENERIC_MESSAGES = {
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'UNAUTHORIZED': 'Authentication required.',
    'FORBIDDEN': 'You do not have permission to perform this action.',
    'NOT_FOUND': 'The requested resource was not found.',
    'THROTTLED': 'Too many requests. Please try again later.',
    'INVALID_CREDENTIALS': 'Invalid credentials.',
    'INTERNAL_ERROR': 'Something went wrong. Please try again later.',
    'SERVICE_UNAVAILABLE': 'Service temporarily unavailable. Please try again later.',
}


def _get_request_id(context):
    request = context.get('request')
    if request and hasattr(request, 'request_id'):
        return request.request_id
    return '-'


def _sanitize_validation_details(detail):
    if isinstance(detail, dict):
        return {k: v if isinstance(v, list) else [str(v)] for k, v in detail.items()}
    if isinstance(detail, list):
        return {'non_field_errors': [str(item) for item in detail]}
    return {'non_field_errors': [str(detail)]}


def _build_error(code, message, details=None):
    payload = {'error': {'code': code, 'message': message}}
    if details:
        payload['error']['details'] = details
    return payload


def custom_exception_handler(exc, context):
    request_id = _get_request_id(context)
    response = drf_exception_handler(exc, context)

    if isinstance(exc, AuthenticationFailed):
        security_logger.warning('auth_failed request_id=%s', request_id)
        from rest_framework.response import Response
        return Response(
            _build_error('INVALID_CREDENTIALS', GENERIC_MESSAGES['INVALID_CREDENTIALS']),
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if isinstance(exc, NotAuthenticated):
        from rest_framework.response import Response
        return Response(
            _build_error('UNAUTHORIZED', GENERIC_MESSAGES['UNAUTHORIZED']),
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if isinstance(exc, ValidationError):
        from rest_framework.response import Response
        details = _sanitize_validation_details(exc.detail)
        return Response(
            _build_error('VALIDATION_ERROR', GENERIC_MESSAGES['VALIDATION_ERROR'], details),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, Throttled):
        from rest_framework.response import Response
        return Response(
            _build_error('THROTTLED', GENERIC_MESSAGES['THROTTLED']),
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    if isinstance(exc, (Http404,)) or (response is not None and response.status_code == 404):
        from rest_framework.response import Response
        return Response(
            _build_error('NOT_FOUND', GENERIC_MESSAGES['NOT_FOUND']),
            status=status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, PermissionDenied) or (response is not None and response.status_code == 403):
        from rest_framework.response import Response
        return Response(
            _build_error('FORBIDDEN', GENERIC_MESSAGES['FORBIDDEN']),
            status=status.HTTP_403_FORBIDDEN,
        )

    if isinstance(exc, (DatabaseError, IntegrityError)):
        logger.error('database_error request_id=%s', request_id, exc_info=True)
        from rest_framework.response import Response
        return Response(
            _build_error('SERVICE_UNAVAILABLE', GENERIC_MESSAGES['SERVICE_UNAVAILABLE']),
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if response is not None:
        code_map = {
            400: 'VALIDATION_ERROR',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            429: 'THROTTLED',
        }
        code = code_map.get(response.status_code, 'INTERNAL_ERROR')
        message = GENERIC_MESSAGES.get(code, GENERIC_MESSAGES['INTERNAL_ERROR'])
        response.data = _build_error(code, message)
        return response

    logger.error('unhandled_exception request_id=%s exc=%s', request_id, type(exc).__name__, exc_info=True)
    from rest_framework.response import Response
    return Response(
        _build_error('INTERNAL_ERROR', GENERIC_MESSAGES['INTERNAL_ERROR']),
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
