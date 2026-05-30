from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.cms.models import CmsPage, MediaAsset, SiteSection
from apps.cms.section_media import publish_section_content

User = get_user_model()


@override_settings(
    STORAGES={
        'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
        'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
    },
    MEDIA_ROOT='/tmp/ummah_cms_section_media_test',
)
class SectionMediaTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.asset = MediaAsset.objects.create(
            title='hero',
            folder='home',
            file=SimpleUploadedFile('hero.jpg', b'jpeg-bytes', content_type='image/jpeg'),
            mime_type='image/jpeg',
        )

    def test_publish_section_content_resolves_card_image(self):
        content = {
            'cards': [
                {'title': 'Test', 'image_asset_id': str(self.asset.id), 'image_url': '/old'},
            ],
        }
        published = publish_section_content(content)
        self.assertTrue(published['cards'][0]['image_url'].endswith('hero.jpg'))

    def test_public_sections_api_returns_resolved_urls(self):
        SiteSection.objects.create(
            slug='home-why-build',
            page=CmsPage.HOME,
            label='Why',
            content={
                'title': 'Why we',
                'cards': [{'title': 'Card', 'image_asset_id': str(self.asset.id)}],
            },
            is_published=True,
        )
        r = self.client.get('/api/v1/cms/sections/?page=home')
        self.assertEqual(r.status_code, 200)
        section = next(s for s in r.data['data'] if s['slug'] == 'home-why-build')
        self.assertTrue(section['content']['cards'][0]['image_url'])

    def test_media_file_served_when_not_using_r2(self):
        with self.settings(USE_R2_STORAGE=False, MEDIA_ROOT='/tmp/ummah_cms_section_media_test'):
            r = self.client.get(self.asset.file.url)
            self.assertEqual(r.status_code, 200)
