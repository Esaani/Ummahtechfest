"""Honeypot and anti-abuse helpers for public forms."""

import logging

from rest_framework import serializers

logger = logging.getLogger('ummah_tech_fest')
security_logger = logging.getLogger('security')

# Must stay empty; bots often fill hidden fields named like these.
HONEYPOT_FIELD = 'website'


def _log_honeypot_trigger(request, value):
    """Record honeypot trips for monitoring; do not log the submitted value (may be PII)."""
    path = getattr(request, 'path', '') if request else ''
    user = getattr(request, 'user', None) if request else None
    user_id = getattr(user, 'id', None) if user and getattr(user, 'is_authenticated', False) else None
    security_logger.warning(
        'honeypot_triggered path=%s user_id=%s value_len=%s',
        path,
        user_id or '-',
        len(str(value).strip()),
    )
    logger.info('honeypot_triggered path=%s user_id=%s', path, user_id or '-')


class HoneypotSerializerMixin:
    """Reject requests when the honeypot field is filled."""

    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate(self, attrs):
        raw = self.initial_data.get(HONEYPOT_FIELD, '')
        if raw and str(raw).strip():
            _log_honeypot_trigger(self.context.get('request'), raw)
            raise serializers.ValidationError({HONEYPOT_FIELD: ['Invalid submission.']})
        attrs.pop(HONEYPOT_FIELD, None)
        return super().validate(attrs)


def check_honeypot(data, request=None):
    """Validate honeypot from plain dict (e.g. request.data)."""
    raw = (data.get(HONEYPOT_FIELD) or '').strip()
    if raw:
        _log_honeypot_trigger(request, raw)
        raise serializers.ValidationError({HONEYPOT_FIELD: ['Invalid submission.']})
