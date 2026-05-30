from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.accounts.models import AdminRole
from apps.volunteers.models import VolunteerApplication, VolunteerApplicationStatus, VolunteerRole

User = get_user_model()


class VolunteerAdminApiTest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='ops@example.com',
            password='SecurePass123!',
            is_staff=True,
            admin_role=AdminRole.OPERATIONS,
        )
        self.applicant = User.objects.create_user(
            email='vol@example.com',
            password='SecurePass123!',
        )
        self.role = VolunteerRole.objects.create(
            slug='usher',
            name='Usher',
            category='event_support',
        )
        self.application = VolunteerApplication.objects.create(
            user=self.applicant,
            skills_summary='Organized',
            motivation='Give back',
            code_of_conduct_accepted=True,
        )
        self.application.preferred_roles.add(self.role)
        login = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'ops@example.com', 'password': 'SecurePass123!', 'website': ''},
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.json()["tokens"]["access"]}')

    def test_list_applications(self):
        res = self.client.get('/api/v1/volunteers/admin/applications/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()['data']), 1)

    def test_patch_status(self):
        res = self.client.patch(
            f'/api/v1/volunteers/admin/applications/{self.application.id}/',
            {'status': VolunteerApplicationStatus.UNDER_REVIEW},
        )
        self.assertEqual(res.status_code, 200)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, VolunteerApplicationStatus.UNDER_REVIEW)
