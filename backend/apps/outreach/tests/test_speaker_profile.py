from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.cms.models import FeaturedSpeaker
from apps.outreach.models import SpeakerApplication, SpeakerApplicationStatus
from apps.outreach.services.speaker_sync import sync_featured_speaker_from_application

User = get_user_model()


@override_settings(
    STORAGES={
        'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
        'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
    },
    MEDIA_ROOT='/tmp/ummah_speaker_sync_test',
)
class SpeakerSyncTest(TestCase):
    def setUp(self):
        from apps.cms.models import MediaAsset

        self.asset = MediaAsset.objects.create(
            title='headshot.jpg',
            folder='speaker-applications',
            file=SimpleUploadedFile('headshot.jpg', b'jpeg-bytes', content_type='image/jpeg'),
            mime_type='image/jpeg',
        )
        self.application = SpeakerApplication.objects.create(
            full_name='Amina Asante',
            email='amina@example.com',
            professional_title='Lead Engineer',
            organization='EthioChain',
            bio='Building ethical fintech across East Africa with a focus on community impact.',
            profile_image_asset=self.asset,
            session_title='Trust Layers in Ummah Fintech',
            track='ummah_fintech',
            session_format='keynote',
            abstract='A deep dive into compliance-aware product design for Muslim-majority markets.',
            key_takeaways='Risk, trust, scale',
        )

    def test_accepted_application_publishes_featured_speaker(self):
        self.application.status = SpeakerApplicationStatus.ACCEPTED
        self.application.save()
        sync_featured_speaker_from_application(self.application)

        featured = FeaturedSpeaker.objects.get(speaker_application=self.application)
        self.assertTrue(featured.is_published)
        self.assertEqual(featured.name, 'Amina Asante')
        self.assertEqual(featured.image_asset_id, self.asset.id)
        self.assertIn('EthioChain', featured.role)

    def test_rejected_application_unpublishes_featured_speaker(self):
        self.application.status = SpeakerApplicationStatus.ACCEPTED
        self.application.save()
        sync_featured_speaker_from_application(self.application)

        self.application.status = SpeakerApplicationStatus.REJECTED
        self.application.save()
        sync_featured_speaker_from_application(self.application)

        featured = FeaturedSpeaker.objects.get(speaker_application=self.application)
        self.assertFalse(featured.is_published)


class SpeakerApplicationPhotoTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.photo = SimpleUploadedFile('headshot.jpg', b'jpeg-bytes', content_type='image/jpeg')
        self.base_payload = {
            'full_name': 'Amina Asante',
            'email': 'amina@example.com',
            'professional_title': 'Lead Engineer',
            'organization': 'EthioChain',
            'bio': 'Building ethical fintech across East Africa with a focus on community impact.',
            'session_title': 'Trust Layers in Ummah Fintech',
            'track': 'ummah_fintech',
            'session_format': 'keynote',
            'abstract': (
                'A deep dive into compliance-aware product design for Muslim-majority markets, '
                'covering architecture, governance, and go-to-market patterns.'
            ),
            'key_takeaways': '1. Risk\n2. Trust\n3. Scale',
        }

    def test_speaker_application_requires_profile_photo(self):
        r = self.client.post('/api/v1/outreach/speaker-applications/', self.base_payload, format='multipart')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_speaker_application_with_photo(self):
        payload = {**self.base_payload, 'profile_photo': self.photo}
        r = self.client.post('/api/v1/outreach/speaker-applications/', payload, format='multipart')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        app = SpeakerApplication.objects.get(email='amina@example.com')
        self.assertIsNotNone(app.profile_image_asset_id)

    def test_accepting_application_via_admin_publishes_homepage_speaker(self):
        payload = {**self.base_payload, 'profile_photo': SimpleUploadedFile(
            'headshot.jpg', b'jpeg-bytes', content_type='image/jpeg',
        )}
        create = self.client.post('/api/v1/outreach/speaker-applications/', payload, format='multipart')
        app_id = create.data['data']['id']

        admin = User.objects.create_superuser(email='admin@example.com', password='SecurePass123!')
        login = self.client.post('/api/v1/auth/login/', {
            'email': admin.email,
            'password': 'SecurePass123!',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["tokens"]["access"]}')

        r = self.client.patch(
            f'/api/v1/outreach/admin/speaker-applications/{app_id}/',
            {'status': 'accepted'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        speakers = self.client.get('/api/v1/cms/speakers/')
        self.assertEqual(speakers.status_code, status.HTTP_200_OK)
        names = [s['name'] for s in speakers.data['data']]
        self.assertIn('Amina Asante', names)
        speaker = next(s for s in speakers.data['data'] if s['name'] == 'Amina Asante')
        self.assertTrue(speaker['bio'])
        self.assertTrue(speaker['image'])
