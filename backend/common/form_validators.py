import re

from rest_framework import serializers

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


def normalize_email(value):
    return value.lower().strip()


def validate_person_name(value, field_label='Name'):
    value = (value or '').strip()
    if len(value) < 2:
        raise serializers.ValidationError(f'{field_label} must be at least 2 characters.')
    if len(value) > 200:
        raise serializers.ValidationError(f'{field_label} is too long.')
    return value


def validate_email_field(value):
    value = normalize_email(value)
    if not EMAIL_RE.match(value):
        raise serializers.ValidationError('Enter a valid email address.')
    return value


def validate_optional_url(value):
    from django.core.validators import URLValidator
    from django.core.exceptions import ValidationError as DjangoValidationError

    value = (value or '').strip()
    if not value:
        return ''
    if not value.startswith(('http://', 'https://')):
        value = f'https://{value}'
    if len(value) > 500:
        raise serializers.ValidationError('URL is too long.')
    try:
        URLValidator()(value)
    except DjangoValidationError:
        raise serializers.ValidationError('Enter a valid URL or leave this field empty.')
    return value
