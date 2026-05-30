from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import PasswordReset

User = get_user_model()


@override_settings(
    CELERY_TASK_ALWAYS_EAGER=True,
    FRONTEND_URL='http://localhost:5173',
    PASSWORD_RESET_EXPIRY_HOURS=1,
)
class PasswordResetAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='reset@example.com', password='OldPass123!')
        self.request_url = '/api/v1/auth/password-reset/request/'
        self.confirm_url = '/api/v1/auth/password-reset/confirm/'

    def test_request_returns_generic_success(self):
        r = self.client.post(self.request_url, {'email': 'reset@example.com', 'website': ''}, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn('message', r.data['data'])

    def test_request_unknown_email_same_response(self):
        r = self.client.post(self.request_url, {'email': 'ghost@example.com', 'website': ''}, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_full_reset_flow(self):
        self.client.post(self.request_url, {'email': 'reset@example.com', 'website': ''}, format='json')
        self.assertEqual(len(mail.outbox), 1)
        reset = PasswordReset.objects.get(user=self.user, used_at__isnull=True)
        body = mail.outbox[0].body
        self.assertIn(str(reset.id), body)

        import re
        token_match = re.search(r'token=([A-Za-z0-9_-]+)', body)
        self.assertIsNotNone(token_match)
        raw_token = token_match.group(1)

        confirm = self.client.post(self.confirm_url, {
            'reset_id': str(reset.id),
            'token': raw_token,
            'password': 'NewSecure456!',
            'password_confirm': 'NewSecure456!',
            'website': '',
        }, format='json')
        self.assertEqual(confirm.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewSecure456!'))

        login = self.client.post('/api/v1/auth/login/', {
            'email': 'reset@example.com',
            'password': 'NewSecure456!',
            'website': '',
        }, format='json')
        self.assertEqual(login.status_code, status.HTTP_200_OK)

    def test_confirm_honeypot_rejected(self):
        r = self.client.post(self.confirm_url, {
            'reset_id': '00000000-0000-0000-0000-000000000001',
            'token': 'bad',
            'password': 'NewSecure456!',
            'password_confirm': 'NewSecure456!',
            'website': 'spam',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
