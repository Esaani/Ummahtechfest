from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core import mail
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import EmailVerification

User = get_user_model()


class AuthAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.send_otp_url = '/api/v1/auth/signup/verify-email/send/'
        self.confirm_otp_url = '/api/v1/auth/signup/verify-email/confirm/'
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.me_url = '/api/v1/auth/me/'

    def _verified_signup_token(self, email='volunteer@example.com', code='123456'):
        self.client.post(self.send_otp_url, {'email': email, 'website': ''}, format='json')
        verification = EmailVerification.objects.get(email=email)
        verification.otp_hash = make_password(code)
        verification.save(update_fields=['otp_hash'])
        confirm = self.client.post(self.confirm_otp_url, {
            'verification_id': str(verification.id),
            'code': code,
            'website': '',
        }, format='json')
        return confirm.data['data']['signup_token']

    @override_settings(EMAIL_OTP_RESEND_COOLDOWN_SECONDS=0)
    def test_register_and_me(self):
        signup_token = self._verified_signup_token()
        response = self.client.post(self.register_url, {
            'signup_token': signup_token,
            'password': 'SecurePass123!',
            'first_name': 'Amina',
            'last_name': 'Hassan',
            'website': '',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        token = response.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me = self.client.get(self.me_url)
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data['data']['email'], 'volunteer@example.com')

    def test_login_invalid_credentials_generic(self):
        User.objects.create_user(email='user@example.com', password='SecurePass123!')
        response = self.client.post(self.login_url, {
            'email': 'user@example.com',
            'password': 'wrong-password',
            'website': '',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = str(response.data)
        self.assertNotIn('user@example.com', body)
        self.assertNotIn('password', body.lower())

    def test_login_unknown_email_same_error_shape(self):
        response = self.client.post(self.login_url, {
            'email': 'nobody@example.com',
            'password': 'SecurePass123!',
            'website': '',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_honeypot_rejected(self):
        response = self.client.post(self.login_url, {
            'email': 'nobody@example.com',
            'password': 'SecurePass123!',
            'website': 'filled-by-bot',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
