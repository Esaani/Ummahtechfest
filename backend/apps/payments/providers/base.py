from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from apps.payments.models import Payment


class PaymentProviderError(Exception):
    """Raised when a payment provider API call fails."""

    def __init__(
        self,
        message: str,
        *,
        code: str = 'PAYMENT_UNAVAILABLE',
        user_message: str | None = None,
    ):
        super().__init__(message)
        self.code = code
        self.user_message = user_message or (
            'We could not process your payment right now. Please try again later.'
        )


class PaymentProviderBackend:
    """Base class for payment providers. Subclass for each provider."""

    name: str = ''

    def initialize(self, payment: Payment, callback_url: str) -> dict[str, Any]:
        """
        Start checkout with the provider.
        Returns dict with at least authorization_url and reference.
        """
        raise NotImplementedError

    def verify(self, reference: str) -> dict[str, Any]:
        """
        Verify transaction status with the provider.
        Returns dict with status ('success'|'failed'), provider_reference, and raw data.
        """
        raise NotImplementedError

    def validate_webhook(self, request) -> dict[str, Any]:
        """
        Validate webhook signature and return parsed event payload.
        """
        raise NotImplementedError
