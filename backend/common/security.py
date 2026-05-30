"""Honeypot and anti-abuse helpers for public forms."""

from rest_framework import serializers

# Must stay empty; bots often fill hidden fields named like these.
HONEYPOT_FIELD = 'website'


class HoneypotSerializerMixin:
    """Reject requests when the honeypot field is filled."""

    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate(self, attrs):
        raw = self.initial_data.get(HONEYPOT_FIELD, '')
        if raw and str(raw).strip():
            raise serializers.ValidationError({HONEYPOT_FIELD: ['Invalid submission.']})
        attrs.pop(HONEYPOT_FIELD, None)
        return super().validate(attrs)


def check_honeypot(data):
    """Validate honeypot from plain dict (e.g. request.data)."""
    if data.get(HONEYPOT_FIELD, '').strip():
        raise serializers.ValidationError({HONEYPOT_FIELD: ['Invalid submission.']})
