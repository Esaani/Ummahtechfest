import hashlib
import hmac
import json
from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.test import RequestFactory, TestCase, override_settings

from apps.payments.models import Payment, PaymentProvider, PaymentPurpose, PaymentStatus
from apps.payments.providers.paystack import PaystackBackend
from apps.payments.providers.base import PaymentProviderError


@override_settings(
    PAYSTACK_SECRET_KEY='sk_test_secret',
    PAYSTACK_WEBHOOK_SECRET='sk_test_secret',
)
class PaystackBackendTest(TestCase):
    def setUp(self):
        self.backend = PaystackBackend()
        self.payment = Payment.objects.create(
            provider=PaymentProvider.PAYSTACK,
            purpose=PaymentPurpose.DONATION,
            amount=Decimal('50.00'),
            email='donor@example.com',
        )

    @patch('apps.payments.providers.paystack.urlopen')
    def test_request_includes_user_agent(self, mock_urlopen):
        mock_urlopen.return_value.__enter__.return_value.read.return_value = json.dumps(
            {'status': True, 'data': {}},
        ).encode()
        self.backend._request('GET', '/transaction/verify/ref')
        req = mock_urlopen.call_args[0][0]
        user_agent = req.headers.get('User-agent') or req.headers.get('User-Agent', '')
        self.assertTrue(user_agent)
        self.assertNotIn('Python-urllib', user_agent)

    @patch.object(PaystackBackend, '_request')
    def test_initialize_returns_authorization_url(self, mock_request):
        mock_request.return_value = {
            'status': True,
            'data': {
                'authorization_url': 'https://checkout.paystack.com/abc',
                'reference': self.payment.reference,
                'access_code': 'code',
            },
        }
        result = self.backend.initialize(self.payment, 'http://localhost/payment/verify')
        self.assertEqual(result['authorization_url'], 'https://checkout.paystack.com/abc')
        mock_request.assert_called_once()
        call_payload = mock_request.call_args[0][2]
        self.assertEqual(call_payload['amount'], 5000)

    @patch.object(PaystackBackend, '_request')
    def test_verify_success(self, mock_request):
        mock_request.return_value = {
            'status': True,
            'data': {'status': 'success', 'id': 999},
        }
        result = self.backend.verify(self.payment.reference)
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['provider_reference'], '999')

    def test_validate_webhook_signature(self):
        payload = {'event': 'charge.success', 'data': {'reference': self.payment.reference, 'id': 1}}
        body = json.dumps(payload).encode('utf-8')
        signature = hmac.new(b'sk_test_secret', body, hashlib.sha512).hexdigest()
        factory = RequestFactory()
        request = factory.post(
            '/api/v1/payments/webhook/paystack/',
            data=body,
            content_type='application/json',
            HTTP_X_PAYSTACK_SIGNATURE=signature,
        )
        parsed = self.backend.validate_webhook(request)
        self.assertEqual(parsed['event'], 'charge.success')

    def test_validate_webhook_rejects_bad_signature(self):
        factory = RequestFactory()
        request = factory.post(
            '/api/v1/payments/webhook/paystack/',
            data=b'{}',
            content_type='application/json',
            HTTP_X_PAYSTACK_SIGNATURE='bad',
        )
        with self.assertRaises(PaymentProviderError):
            self.backend.validate_webhook(request)
