from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import EmailVerification

User = get_user_model()


class EmailVerificationAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.send_url = '/api/v1/auth/signup/verify-email/send/'
        self.confirm_url = '/api/v1/auth/signup/verify-email/confirm/'
        self.resend_url = '/api/v1/auth/signup/verify-email/resend/'
        self.register_url = '/api/v1/auth/register/'

    def _send_otp(self, email='newuser@example.com'):
        return self.client.post(self.send_url, {'email': email, 'website': ''}, format='json')

    def test_send_otp_queues_email(self):
        response = self._send_otp()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('verification_id', response.data['data'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('verification code', mail.outbox[0].subject.lower())

    def test_honeypot_rejects_send_otp(self):
        response = self.client.post(self.send_url, {
            'email': 'bot@example.com',
            'website': 'https://spam.example',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_requires_verified_token(self):
        response = self.client.post(self.register_url, {
            'signup_token': 'invalid',
            'password': 'SecurePass123!',
            'website': '',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(EMAIL_OTP_RESEND_COOLDOWN_SECONDS=0)
    def test_full_signup_flow(self):
        send = self._send_otp()
        verification_id = send.data['data']['verification_id']
        verification = EmailVerification.objects.get(id=verification_id)

        from django.contrib.auth.hashers import make_password
        verification.otp_hash = make_password('123456')
        verification.save(update_fields=['otp_hash'])

        confirm = self.client.post(self.confirm_url, {
            'verification_id': verification_id,
            'code': '123456',
            'website': '',
        }, format='json')
        self.assertEqual(confirm.status_code, status.HTTP_200_OK)
        signup_token = confirm.data['data']['signup_token']

        register = self.client.post(self.register_url, {
            'signup_token': signup_token,
            'password': 'SecurePass123!',
            'first_name': 'Test',
            'last_name': 'User',
            'website': '',
        }, format='json')
        self.assertEqual(register.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
        self.assertGreaterEqual(len(mail.outbox), 2)

    def test_duplicate_email_blocked_at_send(self):
        User.objects.create_user(email='taken@example.com', password='SecurePass123!')
        response = self._send_otp('taken@example.com')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error']['code'], 'EMAIL_ALREADY_REGISTERED')

    @override_settings(EMAIL_OTP_RESEND_COOLDOWN_SECONDS=0)
    def test_resend_otp(self):
        send = self._send_otp()
        verification_id = send.data['data']['verification_id']
        initial_count = len(mail.outbox)
        resend = self.client.post(self.resend_url, {
            'verification_id': verification_id,
            'website': '',
        }, format='json')
        self.assertEqual(resend.status_code, status.HTTP_200_OK)
        self.assertGreater(len(mail.outbox), initial_count)
