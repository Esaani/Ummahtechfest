import hashlib
import hmac
import json
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.payments.models import Donation, Payment, PaymentPurpose, PaymentStatus
from apps.registrations.models import PassFlow, PassRegistration, PassRegistrationStatus, PassType

User = get_user_model()


def _auth_client(email='pay@example.com', password='SecurePass123!'):
    client = APIClient()
    User.objects.create_user(email=email, password=password)
    login = client.post('/api/v1/auth/login/', {'email': email, 'password': password, 'website': ''}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["tokens"]["access"]}')
    return client


@override_settings(
    PAYSTACK_SECRET_KEY='sk_test',
    DEFAULT_PAYMENT_PROVIDER='paystack',
    PASS_DEFAULT_PRICES_GHS={'delegate': '750'},
)
class PaymentAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='delegate@example.com', password='SecurePass123!')
        PassType.objects.create(slug='delegate', name='Delegate', flow=PassFlow.OPEN, price_ghs=750)
        self.client = APIClient()
        login = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'delegate@example.com', 'password': 'SecurePass123!', 'website': ''},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["tokens"]["access"]}')
        PassRegistration.objects.create(
            user=self.user,
            pass_type=PassType.objects.get(slug='delegate'),
            status=PassRegistrationStatus.PENDING_PAYMENT,
        )

    @patch('apps.payments.providers.paystack.PaystackBackend.initialize')
    def test_initialize_pass_payment(self, mock_init):
        mock_init.return_value = {
            'authorization_url': 'https://checkout.paystack.com/x',
            'reference': 'utf_ref',
            'access_code': 'c',
            'raw': {},
        }
        r = self.client.post('/api/v1/payments/initialize/', {}, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn('authorization_url', r.data['data'])
        self.assertTrue(Payment.objects.filter(purpose=PaymentPurpose.PASS_REGISTRATION).exists())

    def test_initialize_requires_pending_payment(self):
        reg = PassRegistration.objects.get(user=self.user)
        reg.status = PassRegistrationStatus.PAID
        reg.save()
        r = self.client.post('/api/v1/payments/initialize/', {}, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.payments.providers.paystack.PaystackBackend.initialize')
    def test_donation_create(self, mock_init):
        mock_init.return_value = {
            'authorization_url': 'https://checkout.paystack.com/donate',
            'reference': 'utf_donate',
            'access_code': 'c',
            'raw': {},
        }
        client = APIClient()
        r = client.post(
            '/api/v1/payments/donations/',
            {
                'amount': '100.00',
                'donor_name': 'Fatima',
                'donor_email': 'fatima@example.com',
                'message': 'For the cause',
                'website': '',
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['authorization_url'], 'https://checkout.paystack.com/donate')

    @override_settings(PAYSTACK_SECRET_KEY='')
    def test_donation_unconfigured_returns_safe_error(self):
        client = APIClient()
        r = client.post(
            '/api/v1/payments/donations/',
            {
                'amount': '100.00',
                'donor_name': 'Fatima',
                'donor_email': 'fatima@example.com',
                'website': '',
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        message = r.data['error']['message'].lower()
        self.assertNotIn('paystack', message)
        self.assertNotIn('configured', message)
        self.assertIn('payment', message)

    def test_donation_honeypot(self):
        client = APIClient()
        r = client.post(
            '/api/v1/payments/donations/',
            {
                'amount': '50',
                'donor_name': 'Bot',
                'donor_email': 'bot@evil.com',
                'website': 'http://spam.com',
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_donations_requires_admin_permission(self):
        r = self.client.get('/api/v1/payments/admin/donations/')
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_donations_list(self):
        admin = User.objects.create_superuser(email='admin@example.com', password='SecurePass123!')
        client = APIClient()
        login = client.post(
            '/api/v1/auth/login/',
            {'email': admin.email, 'password': 'SecurePass123!', 'website': ''},
            format='json',
        )
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["tokens"]["access"]}')
        payment = Payment.objects.create(
            provider='paystack',
            purpose=PaymentPurpose.DONATION,
            amount=Decimal('75'),
            email='donor@example.com',
            reference='utf_admin_donation',
            status=PaymentStatus.SUCCESS,
        )
        Donation.objects.create(
            payment=payment,
            donor_name='Aisha',
            donor_email='donor@example.com',
            message='Keep going',
        )

        r = client.get('/api/v1/payments/admin/donations/')

        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['data'][0]['payment_reference'], 'utf_admin_donation')
        self.assertEqual(r.data['data'][0]['amount'], '75.00')

    @patch('apps.payments.services.send_email_task.delay')
    def test_successful_anonymous_donation_sends_thank_you_email(self, mock_delay):
        payment = Payment.objects.create(
            provider='paystack',
            purpose=PaymentPurpose.DONATION,
            amount=Decimal('50'),
            email='anonymous@example.com',
            reference='utf_anon_donation',
        )
        Donation.objects.create(
            payment=payment,
            donor_name='Private Donor',
            donor_email='anonymous@example.com',
            is_anonymous=True,
        )

        from apps.payments.services import mark_payment_success

        mark_payment_success(payment, 'provider-1')

        mock_delay.assert_called_once()
        self.assertEqual(mock_delay.call_args.args[0], 'donation_received')
        self.assertEqual(mock_delay.call_args.args[1], 'anonymous@example.com')

    @patch('apps.payments.providers.paystack.PaystackBackend.validate_webhook')
    def test_webhook_charge_success(self, mock_validate):
        payment = Payment.objects.create(
            provider='paystack',
            purpose=PaymentPurpose.DONATION,
            amount=Decimal('50'),
            email='a@b.com',
            reference='utf_webhook_test',
        )
        mock_validate.return_value = {
            'event': 'charge.success',
            'data': {'reference': payment.reference, 'id': 42},
        }
        payload = json.dumps(mock_validate.return_value).encode()
        sig = hmac.new(b'sk_test', payload, hashlib.sha512).hexdigest()
        client = APIClient()
        r = client.post(
            '/api/v1/payments/webhook/paystack/',
            data=payload,
            content_type='application/json',
            HTTP_X_PAYSTACK_SIGNATURE=sig,
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        payment.refresh_from_db()
        self.assertEqual(payment.status, PaymentStatus.SUCCESS)

    @patch('apps.payments.providers.paystack.PaystackBackend.verify')
    def test_verify_pass_payment(self, mock_verify):
        payment = Payment.objects.create(
            provider='paystack',
            purpose=PaymentPurpose.PASS_REGISTRATION,
            amount=Decimal('750'),
            email=self.user.email,
            user=self.user,
            pass_registration=PassRegistration.objects.get(user=self.user),
            reference='utf_verify_me',
        )
        mock_verify.return_value = {'status': 'success', 'provider_reference': '99', 'raw': {}}
        r = self.client.get(f'/api/v1/payments/verify/{payment.reference}/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['data']['status'], PaymentStatus.SUCCESS)
