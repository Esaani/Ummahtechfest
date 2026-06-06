from django.conf import settings

from apps.payments.providers.base import PaymentProviderBackend, PaymentProviderError
from apps.payments.providers.paystack import PaystackBackend

_REGISTRY = {
    'paystack': PaystackBackend,
}


def get_provider(name: str | None = None) -> PaymentProviderBackend:
    """Return the configured provider backend."""
    provider_name = name or getattr(settings, 'DEFAULT_PAYMENT_PROVIDER', 'paystack')
    cls = _REGISTRY.get(provider_name)
    if not cls:
        raise PaymentProviderError(
            f'Unknown payment provider: {provider_name}',
            code='PAYMENT_UNAVAILABLE',
        )
    return cls()


__all__ = [
    'PaymentProviderBackend',
    'PaymentProviderError',
    'PaystackBackend',
    'get_provider',
]
