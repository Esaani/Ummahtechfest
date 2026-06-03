from django.core.management.base import BaseCommand

from apps.cms.models import CmsPage, SiteSection

DEFAULT_SECTIONS = [
    {
        'slug': 'home-hero',
        'page': CmsPage.HOME,
        'label': 'Home — Hero',
        'sort_order': 0,
        'content': {
            'badge': 'ACCRA, GHANA • NOV 2026',
            'headline': 'The Future of',
            'headline_highlight': 'Muslim Tech',
            'headline_suffix': 'Excellence',
            'subtitle': (
                "Join 5,000+ developers, innovators, and visionaries for Africa's largest "
                'gathering of Muslim tech talent. Bridging tradition and transformation in the heart of West Africa.'
            ),
            'subtitle_mobile': (
                "Join 5,000+ innovators for Africa's largest gathering of Muslim tech talent."
            ),
            'video_url': '',
            'poster_url': '',
        },
    },
    {
        'slug': 'home-why-build',
        'page': CmsPage.HOME,
        'label': 'Home — Why We Build',
        'sort_order': 10,
        'content': {
            'title': 'Why we',
            'title_highlight': 'build',
            'cards': [
                {
                    'title': "We've always been pioneers",
                    'text': "Algebra. Medicine. Optics. Two-thirds of the stars bear names we gave them. From the stars to the algorithm — we've always led.",
                    'image_url': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
                },
                {
                    'title': 'Owning the platform shift',
                    'text': 'Bricks to bytes. Factories to platforms. The greatest opportunity of our lifetime is here, and we intend to own it.',
                    'image_url': '',
                },
                {
                    'title': 'We are the guardians of tech',
                    'text': "We are guardians of mankind. It's our responsibility to ensure technology serves humanity the right way.",
                    'image_url': '',
                },
                {
                    'title': 'Ummah is the standard',
                    'text': "Pioneers. Category-defining founders. Legendary engineers. Excellence isn't the goal — it's the entry requirement.",
                    'image_url': '',
                },
            ],
        },
    },
    {
        'slug': 'home-stats',
        'page': CmsPage.HOME,
        'label': 'Home — Stats',
        'sort_order': 20,
        'content': {
            'items': [
                {'icon': 'diversity_3', 'value': '5,000+', 'label': 'Global Attendees'},
                {'icon': 'rocket_launch', 'value': '40+', 'label': 'Workshops'},
                {'icon': 'trophy', 'value': '$50k', 'label': 'Hackathon Prize'},
                {'icon': 'record_voice_over', 'value': '20', 'label': 'Legendary speakers'},
            ],
        },
    },
    {
        'slug': 'home-partners',
        'page': CmsPage.HOME,
        'label': 'Home — Partners marquee',
        'sort_order': 30,
        'content': {
            'title': 'Global Partners & Sponsors',
            'names': [],
        },
    },
    {
        'slug': 'home-final-cta',
        'page': CmsPage.HOME,
        'label': 'Home — Final CTA',
        'sort_order': 90,
        'content': {
            'badge': 'Limited Spots',
            'headline': 'Ready to build the future?',
            'body': 'Secure your spot at the most anticipated tech event in Africa.',
            'button_text': 'GET YOUR TICKET',
            'button_url': '/signup',
        },
    },
    {
        'slug': 'ghana-2026-hero',
        'page': CmsPage.GHANA_2026,
        'label': 'Ghana 2026 — Hero',
        'sort_order': 0,
        'content': {
            'badge': 'Digital Gateway',
            'headline': 'ACCRA',
            'headline_highlight': '2026',
            'subtitle': (
                "Step into the heart of West Africa's technological revolution. Ummah Tech Fest lands in Ghana, "
                'bridging global innovation with rich heritage.'
            ),
            'image_url': '/assets/images/ghana-2026-event.jpg',
        },
    },
    {
        'slug': 'sponsor-hero',
        'page': CmsPage.GLOBAL,
        'label': 'Sponsor page — Hero image',
        'sort_order': 5,
        'content': {
            'hero_image_url': '',
            'stat_value': '5,000+',
            'stat_label': 'Targeted Tech Professionals',
        },
    },
    {
        'slug': 'global-footer',
        'page': CmsPage.GLOBAL,
        'label': 'Global — Footer tagline',
        'sort_order': 0,
        'content': {
            'tagline': 'Cultivating Ihsaan in the Digital Realm.',
            'copyright': 'Ummah Tech Fest Ghana 2026',
        },
    },
]


class Command(BaseCommand):
    help = 'Seed default CMS site sections (also run via: python manage.py seed)'

    def handle(self, *args, **options):
        created = 0
        skipped = 0
        for item in DEFAULT_SECTIONS:
            section, was_created = SiteSection.objects.get_or_create(
                slug=item['slug'],
                defaults={
                    'page': item['page'],
                    'label': item['label'],
                    'content': item['content'],
                    'sort_order': item['sort_order'],
                    'is_published': True,
                },
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f'Created {section.slug}'))
                continue

            section.page = item['page']
            section.label = item['label']
            section.sort_order = item['sort_order']
            section.is_published = True
            section.save(update_fields=['page', 'label', 'sort_order', 'is_published', 'updated_at'])
            skipped += 1
            self.stdout.write(f'Kept content for {section.slug}')
        self.stdout.write(self.style.SUCCESS(f'Done: {created} created, {skipped} existing (content preserved)'))
