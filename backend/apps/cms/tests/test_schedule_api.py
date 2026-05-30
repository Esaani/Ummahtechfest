from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import AdminRole
from apps.cms.models import ScheduleSession, ScheduleTrack

User = get_user_model()


class ScheduleApiTest(APITestCase):
    def setUp(self):
        self.content = User.objects.create_user(
            email='cms@example.com',
            password='SecurePass123!',
            is_staff=True,
            admin_role=AdminRole.CONTENT_MANAGER,
        )
        ScheduleSession.objects.create(
            slug='day1-keynote',
            title='Opening Keynote',
            day_label='01',
            time_label='09:00 AM',
            track=ScheduleTrack.MAIN_STAGE,
            show_on_home=True,
            is_published=True,
        )
        ScheduleSession.objects.create(
            slug='day2-draft',
            title='Draft Session',
            day_label='02',
            time_label='10:00 AM',
            is_published=False,
        )

    def test_public_schedule_home_only(self):
        r = self.client.get('/api/v1/cms/schedule/?home=1')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data['data']), 1)
        self.assertEqual(r.data['data'][0]['title'], 'Opening Keynote')

    def test_admin_create_session(self):
        login = self.client.post('/api/v1/auth/login/', {
            'email': 'cms@example.com',
            'password': 'SecurePass123!',
            'website': '',
        })
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["tokens"]["access"]}')
        r = self.client.post('/api/v1/cms/admin/schedule/', {
            'item_type': 'session',
            'event_day': 1,
            'day_label': '01',
            'starts_at_time': '11:00',
            'time_label': '11:00 AM',
            'title': 'Fintech Panel',
            'subtitle': 'Islamic finance innovation',
            'track': ScheduleTrack.FINTECH,
            'is_published': True,
            'show_on_home': False,
            'sort_order': 5,
            'outcomes': [],
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ScheduleSession.objects.filter(title='Fintech Panel').count(), 1)
