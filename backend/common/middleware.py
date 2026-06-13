import json
import logging
import time
import uuid

logger = logging.getLogger('ummah_tech_fest')


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())
        request.request_id = request_id
        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = int((time.monotonic() - start) * 1000)
        user_id = (
            getattr(request.user, 'id', None)
            if getattr(request, 'user', None) and request.user.is_authenticated
            else '-'
        )
        logger.info(
            'request_completed method=%s path=%s status=%s duration_ms=%s request_id=%s user_id=%s',
            request.method,
            request.path,
            response.status_code,
            duration_ms,
            request_id,
            user_id,
            extra={'request_id': request_id, 'user_id': str(user_id)},
        )

        # Log response body for non-2xx to aid debugging (DEBUG level only).
        if logger.isEnabledFor(logging.DEBUG) and not (200 <= response.status_code < 300):
            try:
                body = getattr(response, 'data', None)
                if body is None and hasattr(response, 'content'):
                    body = json.loads(response.content.decode('utf-8', errors='replace'))
                logger.debug(
                    'response_body request_id=%s status=%s body=%s',
                    request_id,
                    response.status_code,
                    body,
                    extra={'request_id': request_id, 'user_id': str(user_id)},
                )
            except Exception:
                pass  # Never let logging break the response

        response['X-Request-ID'] = request_id
        return response
