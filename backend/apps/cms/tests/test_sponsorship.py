from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.cms.models import CmsPage, SiteSection, SponsorshipBenefitRow, SponsorshipPackage

User = get_user_model()


class SponsorshipAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='SecurePass123!',
        )
        SponsorshipBenefitRow.objects.create(key='vip_tickets', label='VIP Tickets', sort_order=1)
        SponsorshipPackage.objects.create(
            slug='gold',
            name='Gold Sponsor',
            tagline='Premium booth',
            price_display='₵15,000',
            benefit_values={'vip_tickets': '5'},
            highlight_column=True,
            is_published=True,
            sort_order=1,
        )

    def _auth(self):
        login = self.client.post('/api/v1/auth/login/', {
            'email': self.admin.email,
            'password': 'SecurePass123!',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["tokens"]["access"]}')

    def test_public_sponsorship_payload(self):
        r = self.client.get('/api/v1/cms/sponsorship/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.data['data']
        self.assertEqual(len(data['comparison_columns']), 1)
        self.assertEqual(data['comparison_columns'][0]['slug'], 'gold')
        self.assertEqual(len(data['comparison_rows']), 1)
        self.assertEqual(data['comparison_rows'][0]['values']['gold'], '5')
        self.assertTrue(any(t['value'] == 'gold' for t in data['inquiry_tiers']))
        self.assertIn('hero', data)
        self.assertEqual(data['hero']['stat_value'], '5,000+')

    def test_public_sponsorship_hero_from_cms_section(self):
        SiteSection.objects.create(
            slug='sponsor-hero',
            page=CmsPage.GLOBAL,
            label='Sponsor hero',
            content={
                'hero_image_url': 'https://media.ummahtechfest.com/cms/sponsor/hero.jpg',
                'stat_value': '10,000+',
                'stat_label': 'Attendees',
            },
            is_published=True,
        )
        r = self.client.get('/api/v1/cms/sponsorship/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['data']['hero']['hero_image_url'], 'https://media.ummahtechfest.com/cms/sponsor/hero.jpg')
        self.assertEqual(r.data['data']['hero']['stat_value'], '10,000+')

    def test_admin_create_package(self):
        self._auth()
        r = self.client.post('/api/v1/cms/admin/sponsorship/packages/', {
            'slug': 'silver',
            'name': 'Silver Sponsor',
            'tagline': 'Standard booth',
            'price_display': '₵5,000',
            'benefit_values': {'vip_tickets': '2'},
            'is_published': True,
            'sort_order': 0,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['slug'], 'silver')

    def test_sponsor_inquiry_uses_cms_tier_slug(self):
        r = self.client.post('/api/v1/outreach/sponsor-inquiries/', {
            'full_name': 'Ada Lovelace',
            'company_name': 'Analytical Engines',
            'email': 'ada@example.com',
            'tier_interest': 'gold',
            'requirements': '',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']['tier_interest_label'], 'Gold Sponsor')
