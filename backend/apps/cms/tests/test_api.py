from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.cms.models import CmsPage, SiteSection

User = get_user_model()


@override_settings(
    STORAGES={
        'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
        'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
    },
    MEDIA_ROOT='/tmp/ummah_cms_test_media',
)
class CmsAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.superuser = User.objects.create_superuser(
            email='admin@example.com',
            password='SecurePass123!',
        )
        self.user = User.objects.create_user(
            email='user@example.com',
            password='SecurePass123!',
        )
        SiteSection.objects.create(
            slug='home-hero',
            page=CmsPage.HOME,
            label='Home Hero',
            content={'headline': 'Test Headline'},
            is_published=True,
            sort_order=0,
        )
        SiteSection.objects.create(
            slug='home-draft',
            page=CmsPage.HOME,
            label='Draft',
            content={},
            is_published=False,
            sort_order=1,
        )

    def _auth(self, user):
        login = self.client.post('/api/v1/auth/login/', {
            'email': user.email,
            'password': 'SecurePass123!',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["tokens"]["access"]}')

    def test_public_sections_only_published(self):
        r = self.client.get('/api/v1/cms/sections/?page=home')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        slugs = [s['slug'] for s in r.data['data']]
        self.assertIn('home-hero', slugs)
        self.assertNotIn('home-draft', slugs)

    def test_non_superuser_denied_admin(self):
        self._auth(self.user)
        r = self.client.get('/api/v1/cms/admin/sections/')
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_superuser_lists_all_sections(self):
        self._auth(self.superuser)
        r = self.client.get('/api/v1/cms/admin/sections/?page=home')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data['data']), 2)

    def test_superuser_updates_section(self):
        self._auth(self.superuser)
        section = SiteSection.objects.get(slug='home-hero')
        r = self.client.patch(
            f'/api/v1/cms/admin/sections/{section.id}/',
            {'content': {'headline': 'Updated'}},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['data']['content']['headline'], 'Updated')

    def test_superuser_uploads_media(self):
        self._auth(self.superuser)
        image = SimpleUploadedFile('test.png', b'\x89PNG\r\n\x1a\n', content_type='image/png')
        r = self.client.post(
            '/api/v1/cms/admin/media/',
            {'file': image, 'title': 'Test', 'folder': 'home'},
            format='multipart',
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertIn('url', r.data['data'])

    def test_me_includes_superuser_flag(self):
        self._auth(self.superuser)
        r = self.client.get('/api/v1/auth/me/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(r.data['data']['is_superuser'])
