from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class OutreachAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.speaker_payload = {
            'full_name': 'Amina Asante',
            'email': 'amina@example.com',
            'professional_title': 'Lead Engineer',
            'occupation': 'Software Engineer',
            'role': 'Lead Speaker',
            'organization': 'EthioChain',
            'bio': 'Building ethical fintech across East Africa with a focus on community impact.',
            'linkedin_url': 'https://linkedin.com/in/amina',
            'twitter_handle': '@amina',
            'session_title': 'Trust Layers in Ummah Fintech',
            'track': 'ummah_fintech',
            'session_format': 'keynote',
            'abstract': (
                'A deep dive into compliance-aware product design for Muslim-majority markets, '
                'covering architecture, governance, and go-to-market patterns.'
            ),
            'key_takeaways': '1. Risk\n2. Trust\n3. Scale',
        }
        self.admin = User.objects.create_superuser(
            email='admin@ummahtechfest.com',
            password='adminpass123',
        )

    def test_outreach_options(self):
        r = self.client.get('/api/v1/outreach/options/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreater(len(r.data['data']['speaker_tracks']), 0)
        self.assertGreater(len(r.data['data']['sponsor_tiers']), 0)
        self.assertGreater(len(r.data['data']['ticket_waitlist_tiers']), 0)

    def test_sponsor_inquiry_create(self):
        r = self.client.post('/api/v1/outreach/sponsor-inquiries/', {
            'full_name': 'Kwame Bello',
            'company_name': 'Accra Ventures',
            'email': 'kwame@acme.com',
            'tier_interest': 'gold',
            'requirements': 'Booth near main stage.',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['status'], 'new')

    def test_sponsor_inquiry_honeypot_rejected(self):
        r = self.client.post('/api/v1/outreach/sponsor-inquiries/', {
            'full_name': 'Bot',
            'company_name': 'Spam Co',
            'email': 'bot@spam.com',
            'tier_interest': 'gold',
            'website': 'http://spam.example',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_speaker_application_create(self):
        photo = SimpleUploadedFile('headshot.jpg', b'jpeg-bytes', content_type='image/jpeg')
        cv = SimpleUploadedFile('cv.pdf', b'pdf-bytes', content_type='application/pdf')
        payload = {**self.speaker_payload, 'profile_photo': photo, 'cv': cv}
        r = self.client.post('/api/v1/outreach/speaker-applications/', payload, format='multipart')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['status'], 'submitted')

    def test_speaker_short_abstract_rejected(self):
        photo = SimpleUploadedFile('headshot.jpg', b'jpeg-bytes', content_type='image/jpeg')
        cv = SimpleUploadedFile('cv.pdf', b'pdf-bytes', content_type='application/pdf')
        payload = {**self.speaker_payload, 'abstract': 'Too short.', 'profile_photo': photo, 'cv': cv}
        r = self.client.post('/api/v1/outreach/speaker-applications/', payload, format='multipart')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_speaker_duplicate_email_blocked(self):
        photo = SimpleUploadedFile('headshot.jpg', b'jpeg-bytes', content_type='image/jpeg')
        cv = SimpleUploadedFile('cv.pdf', b'pdf-bytes', content_type='application/pdf')
        payload = {**self.speaker_payload, 'profile_photo': photo, 'cv': cv}
        self.client.post('/api/v1/outreach/speaker-applications/', payload, format='multipart')
        r = self.client.post('/api/v1/outreach/speaker-applications/', payload, format='multipart')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ticket_waitlist_create(self):
        r = self.client.post('/api/v1/outreach/ticket-waitlist/', {
            'full_name': 'Fatima Ali',
            'email': 'fatima@example.com',
            'tier_interest': 'early_bird',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['status'], 'new')

    def test_ticket_waitlist_honeypot_rejected(self):
        r = self.client.post('/api/v1/outreach/ticket-waitlist/', {
            'full_name': 'Bot User',
            'email': 'bot@spam.com',
            'website': 'http://spam.example',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ticket_waitlist_duplicate_email(self):
        payload = {'full_name': 'Fatima Ali', 'email': 'fatima@example.com'}
        self.client.post('/api/v1/outreach/ticket-waitlist/', payload, format='json')
        r = self.client.post('/api/v1/outreach/ticket-waitlist/', payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_sponsor_inquiries_requires_superuser(self):
        r = self.client.get('/api/v1/outreach/admin/sponsor-inquiries/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_sponsor_inquiries_list(self):
        self.client.post('/api/v1/outreach/sponsor-inquiries/', {
            'full_name': 'Test',
            'company_name': 'Co',
            'email': 'test@co.com',
            'tier_interest': 'silver',
        }, format='json')
        self.client.force_authenticate(user=self.admin)
        r = self.client.get('/api/v1/outreach/admin/sponsor-inquiries/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data['data']), 1)

    def test_admin_update_sponsor_status(self):
        create = self.client.post('/api/v1/outreach/sponsor-inquiries/', {
            'full_name': 'Test',
            'company_name': 'Co',
            'email': 'status@co.com',
            'tier_interest': 'silver',
        }, format='json')
        inquiry_id = create.data['data']['id']
        self.client.force_authenticate(user=self.admin)
        
        with patch('apps.outreach.admin_views.send_templated_email') as mock_send:
            r = self.client.patch(
                f'/api/v1/outreach/admin/sponsor-inquiries/{inquiry_id}/',
                {'status': 'contacted', 'status_note': 'Test note'},
                format='json',
            )
            self.assertEqual(r.status_code, status.HTTP_200_OK)
            self.assertEqual(r.data['data']['status'], 'contacted')
            mock_send.assert_called_once_with(
                'submission_status_updated',
                'status@co.com',
                {
                    'name': 'Test',
                    'submission_type': 'Sponsorship Inquiry',
                    'status_label': 'Contacted',
                    'message': 'Test note',
                },
            )
