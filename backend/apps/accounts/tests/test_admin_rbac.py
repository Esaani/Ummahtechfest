from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.accounts.models import AdminRole

User = get_user_model()


class AdminRbacTest(APITestCase):
    def setUp(self):
        self.superadmin = User.objects.create_superuser(
            email='super@example.com',
            password='SecurePass123!',
        )
        self.reviewer = User.objects.create_user(
            email='reviewer@example.com',
            password='SecurePass123!',
            is_staff=True,
            admin_role=AdminRole.SUBMISSIONS_REVIEWER,
        )
        self.content = User.objects.create_user(
            email='content@example.com',
            password='SecurePass123!',
            is_staff=True,
            admin_role=AdminRole.CONTENT_MANAGER,
        )

    def _login(self, email, password='SecurePass123!'):
        res = self.client.post('/api/v1/auth/login/', {'email': email, 'password': password, 'website': ''})
        self.assertEqual(res.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {res.json()["tokens"]["access"]}')

    def test_me_includes_admin_permissions_for_reviewer(self):
        self._login('reviewer@example.com')
        res = self.client.get('/api/v1/auth/me/')
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertEqual(data['admin_role'], AdminRole.SUBMISSIONS_REVIEWER)
        self.assertIn('submissions.manage', data['admin_permissions'])
        self.assertNotIn('cms.manage', data['admin_permissions'])

    def test_reviewer_can_list_volunteer_applications(self):
        self._login('reviewer@example.com')
        res = self.client.get('/api/v1/volunteers/admin/applications/')
        self.assertEqual(res.status_code, 200)

    def test_content_manager_cannot_list_volunteer_applications(self):
        self._login('content@example.com')
        res = self.client.get('/api/v1/volunteers/admin/applications/')
        self.assertEqual(res.status_code, 403)

    def test_superadmin_can_invite_staff(self):
        self._login('super@example.com')
        res = self.client.post(
            '/api/v1/auth/admin/users/invite/',
            {'email': 'newstaff@example.com', 'admin_role': AdminRole.SUBMISSIONS_REVIEWER},
        )
        self.assertEqual(res.status_code, 201)
        user = User.objects.get(email='newstaff@example.com')
        self.assertEqual(user.admin_role, AdminRole.SUBMISSIONS_REVIEWER)

    def test_reviewer_cannot_invite_staff(self):
        self._login('reviewer@example.com')
        res = self.client.post(
            '/api/v1/auth/admin/users/invite/',
            {'email': 'blocked@example.com', 'admin_role': AdminRole.CONTENT_MANAGER},
        )
        self.assertEqual(res.status_code, 403)
