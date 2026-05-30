from django.core.management import call_command
from django.test import TestCase

from apps.cms.models import CmsPage, SiteSection


class SeedCmsSectionsTest(TestCase):
    def test_seed_does_not_overwrite_existing_content(self):
        SiteSection.objects.create(
            slug='home-hero',
            page=CmsPage.HOME,
            label='Home — Hero',
            content={
                'headline': 'Custom headline',
                'video_url': 'https://media.ummahtechfest.com/cms/home/hero.mp4',
            },
            is_published=True,
            sort_order=0,
        )

        call_command('seed_cms_sections', verbosity=0)

        section = SiteSection.objects.get(slug='home-hero')
        self.assertEqual(section.content['headline'], 'Custom headline')
        self.assertEqual(section.content['video_url'], 'https://media.ummahtechfest.com/cms/home/hero.mp4')
