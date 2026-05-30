from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.registrations.models import PassFlow, PassType

User = get_user_model()


class RegistrationAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='delegate@example.com', password='SecurePass123!')
        PassType.objects.create(slug='delegate', name='Delegate', flow=PassFlow.OPEN)
        PassType.objects.create(slug='policy', name='Policy', flow=PassFlow.APPROVAL)
        login = self.client.post('/api/v1/auth/login/', {
            'email': 'delegate@example.com', 'password': 'SecurePass123!',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["tokens"]["access"]}')

    def test_open_registration(self):
        PassType.objects.filter(slug='delegate').update(is_open_for_registration=True)
        r = self.client.post('/api/v1/registrations/open/', {
            'pass_type': 'delegate',
            'job_title': 'developer',
            'experience_years': 3,
            'organization': 'Acme',
            'website': '',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['status'], 'pending_payment')

    def test_duplicate_blocked(self):
        PassType.objects.filter(slug='delegate').update(is_open_for_registration=True)
        self.client.post('/api/v1/registrations/open/', {
            'pass_type': 'delegate', 'job_title': 'dev', 'experience_years': 1, 'organization': 'X',
            'website': '',
        }, format='json')
        r = self.client.post('/api/v1/registrations/open/', {
            'pass_type': 'delegate', 'job_title': 'dev', 'experience_years': 1, 'organization': 'Y',
            'website': '',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_special_access_registration(self):
        r = self.client.post('/api/v1/registrations/special-access/', {
            'pass_type': 'policy',
            'organization_name': 'Ministry',
            'job_title': 'Analyst',
            'contribution_statement': 'Policy insights for fintech.',
            'website': '',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['status'], 'submitted')

    def test_open_pass_closed_when_flag_off(self):
        PassType.objects.filter(slug='delegate').update(is_open_for_registration=False)
        r = self.client.post('/api/v1/registrations/open/', {
            'pass_type': 'delegate',
            'job_title': 'developer',
            'experience_years': 3,
            'organization': 'Acme',
            'website': '',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class PassTypeAdminAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='SecurePass123!',
        )
        login = self.client.post('/api/v1/auth/login/', {
            'email': 'admin@example.com',
            'password': 'SecurePass123!',
            'website': '',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["tokens"]["access"]}')

    def test_create_pass_generates_slug_from_name(self):
        r = self.client.post('/api/v1/registrations/admin/pass-types/', {
            'name': 'VIP Executive Pass',
            'description': 'Premium access',
            'flow': PassFlow.OPEN,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['slug'], 'vip-executive-pass')

    def test_create_pass_slug_unique_on_collision(self):
        PassType.objects.create(slug='vip-executive-pass', name='Existing', flow=PassFlow.OPEN)
        r = self.client.post('/api/v1/registrations/admin/pass-types/', {
            'name': 'VIP Executive Pass',
            'flow': PassFlow.OPEN,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['slug'], 'vip-executive-pass-1')
