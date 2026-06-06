import hashlib
import hmac
import json
import logging
from decimal import Decimal
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings

from apps.payments.models import Payment
from apps.payments.providers.base import PaymentProviderBackend, PaymentProviderError

logger = logging.getLogger('ummah_tech_fest')

PAYSTACK_API_BASE = 'https://api.paystack.co'


def _paystack_user_agent() -> str:
    app_name = getattr(settings, 'APP_NAME', 'UmmahTechFest')
    return f'{app_name.replace(" ", "")}/1.0 (payments)'


class PaystackBackend(PaymentProviderBackend):
    name = 'paystack'

    def __init__(self, secret_key: str | None = None):
        self.secret_key = secret_key or getattr(settings, 'PAYSTACK_SECRET_KEY', '')
        if not self.secret_key:
            raise PaymentProviderError(
                'Paystack secret key is not set in server environment.',
                code='PAYMENT_UNAVAILABLE',
            )

    def _request(self, method: str, path: str, payload: dict | None = None) -> dict:
        url = f'{PAYSTACK_API_BASE}{path}'
        data = json.dumps(payload).encode('utf-8') if payload is not None else None
        req = Request(
            url,
            data=data,
            method=method,
            headers={
                'Authorization': f'Bearer {self.secret_key}',
                'Content-Type': 'application/json',
                # Paystack sits behind Cloudflare; urllib without User-Agent gets 403 (error 1010).
                'User-Agent': _paystack_user_agent(),
            },
        )
        try:
            with urlopen(req, timeout=30) as resp:
                body = json.loads(resp.read().decode('utf-8'))
        except HTTPError as exc:
            err_body = exc.read().decode('utf-8', errors='replace')
            logger.error('paystack_http_error path=%s status=%s body=%s', path, exc.code, err_body[:500])
            raise PaymentProviderError('Payment provider request failed.') from exc
        except URLError as exc:
            logger.exception('paystack_network_error path=%s', path)
            raise PaymentProviderError('Payment provider is unavailable.') from exc

        if not body.get('status'):
            provider_message = body.get('message', 'Payment provider error')
            logger.error('paystack_api_rejected path=%s msg=%s', path, provider_message)
            raise PaymentProviderError(
                provider_message,
                code='PAYMENT_UNAVAILABLE',
            )
        return body

    def _amount_kobo(self, amount_ghs: Decimal) -> int:
        return int(amount_ghs * 100)

    def initialize(self, payment: Payment, callback_url: str) -> dict[str, Any]:
        payload = {
            'email': payment.email,
            'amount': self._amount_kobo(payment.amount),
            'currency': payment.currency,
            'reference': payment.reference,
            'callback_url': callback_url,
            'metadata': {
                'purpose': payment.purpose,
                'payment_id': str(payment.id),
            },
        }
        body = self._request('POST', '/transaction/initialize', payload)
        data = body.get('data') or {}
        return {
            'authorization_url': data.get('authorization_url', ''),
            'reference': data.get('reference', payment.reference),
            'access_code': data.get('access_code', ''),
            'raw': data,
        }

    def verify(self, reference: str) -> dict[str, Any]:
        body = self._request('GET', f'/transaction/verify/{reference}')
        data = body.get('data') or {}
        status = data.get('status', '').lower()
        return {
            'status': 'success' if status == 'success' else 'failed',
            'provider_reference': str(data.get('id', '')),
            'amount': data.get('amount'),
            'currency': data.get('currency'),
            'raw': data,
        }

    def validate_webhook(self, request) -> dict[str, Any]:
        signature = request.headers.get('x-paystack-signature', '')
        secret = getattr(settings, 'PAYSTACK_WEBHOOK_SECRET', '') or self.secret_key
        if not secret:
            raise PaymentProviderError(
                'Paystack webhook secret is not set in server environment.',
                code='PAYMENT_UNAVAILABLE',
            )

        body = request.body
        expected = hmac.new(secret.encode('utf-8'), body, hashlib.sha512).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise PaymentProviderError('Invalid webhook signature.')

        try:
            payload = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError as exc:
            raise PaymentProviderError('Invalid webhook payload.') from exc
        return payload
