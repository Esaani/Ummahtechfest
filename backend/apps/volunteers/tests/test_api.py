from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.test.utils import override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.volunteers.models import (
    VolunteerApplication,
    VolunteerApplicationStatus,
    VolunteerRole,
    VolunteerRoleCategory,
)

User = get_user_model()


@override_settings(
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class VolunteerAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='applicant@example.com', password='SecurePass123!')
        self.role = VolunteerRole.objects.create(
            slug='photo',
            name='Photography Volunteer',
            category=VolunteerRoleCategory.CREATIVE_MEDIA,
            description='Photo coverage',
        )
        login = self.client.post('/api/v1/auth/login/', {
            'email': 'applicant@example.com',
            'password': 'SecurePass123!',
            'website': '',
        }, format='json')
        self.token = login.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def _application_payload(self):
        photo = SimpleUploadedFile('test.jpg', b'img', content_type='image/jpeg')
        cv = SimpleUploadedFile('test.pdf', b'pdf', content_type='application/pdf')
        return {
            'phone': '+233200000000',
            'city': 'Accra',
            'country': 'Ghana',
            'occupation': 'Student',
            'skills_summary': 'Photography and editing',
            'motivation': 'Give back to the community',
            'availability': '{"days": ["Friday", "Saturday"]}',
            'experience_years': 2,
            'code_of_conduct_accepted': True,
            'preferred_role_ids': [str(self.role.id)],
            'profile_photo': photo,
            'cv': cv,
        }

    def test_roles_list_query_count(self):
        VolunteerRole.objects.create(
            slug='video', name='Video', category=VolunteerRoleCategory.CREATIVE_MEDIA,
        )
        with self.assertNumQueries(2):
            response = self.client.get('/api/v1/volunteers/roles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['data']), 2)

    def test_submit_and_get_application(self):
        create = self.client.post('/api/v1/volunteers/applications/', self._application_payload(), format='multipart')
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        me = self.client.get('/api/v1/volunteers/applications/me/')
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data['data']['status'], 'submitted')
        self.assertTrue(me.data['data']['can_withdraw'])
        self.assertFalse(me.data['meta']['can_apply'])
        self.assertTrue(me.data['meta']['has_application'])

    def test_duplicate_application_blocked(self):
        VolunteerApplication.objects.create(
            user=self.user,
            occupation='Student',
            skills_summary='x', motivation='y', code_of_conduct_accepted=True,
        )
        response = self.client.post('/api/v1/volunteers/applications/', self._application_payload(), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error']['code'], 'APPLICATION_EXISTS')

    def test_eligibility_endpoint(self):
        eligible = self.client.get('/api/v1/volunteers/applications/eligibility/')
        self.assertTrue(eligible.data['data']['can_apply'])
        VolunteerApplication.objects.create(
            user=self.user,
            occupation='Student',
            skills_summary='x', motivation='y', code_of_conduct_accepted=True,
        )
        ineligible = self.client.get('/api/v1/volunteers/applications/eligibility/')
        self.assertFalse(ineligible.data['data']['can_apply'])

    def test_withdraw_only_when_submitted(self):
        self.client.post('/api/v1/volunteers/applications/', self._application_payload(), format='multipart')
        withdraw = self.client.patch('/api/v1/volunteers/applications/me/', {}, format='json')
        self.assertEqual(withdraw.status_code, status.HTTP_200_OK)
        self.assertEqual(withdraw.data['data']['status'], 'withdrawn')
        self.assertFalse(withdraw.data['meta']['can_withdraw'])

    def test_cannot_withdraw_after_review_starts(self):
        app = VolunteerApplication.objects.create(
            user=self.user,
            status=VolunteerApplicationStatus.UNDER_REVIEW,
            occupation='Student',
            skills_summary='x', motivation='y', code_of_conduct_accepted=True,
        )
        response = self.client.patch('/api/v1/volunteers/applications/me/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_apply_again_after_withdraw(self):
        self.client.post('/api/v1/volunteers/applications/', self._application_payload(), format='multipart')
        self.client.patch('/api/v1/volunteers/applications/me/', {}, format='json')
        retry = self.client.post('/api/v1/volunteers/applications/', self._application_payload(), format='multipart')
        self.assertEqual(retry.status_code, status.HTTP_400_BAD_REQUEST)
