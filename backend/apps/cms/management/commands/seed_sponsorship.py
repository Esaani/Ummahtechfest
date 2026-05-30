from django.core.management.base import BaseCommand

from apps.cms.models import SponsorshipBenefitRow, SponsorshipPackage

BENEFIT_ROWS = [
    ('exhibition_booth', 'Exhibition Booth Size', 10),
    ('speaking_slot', 'Speaking Slot', 20),
    ('logo_placement', 'Logo Placement', 30),
    ('vip_tickets', 'VIP Tickets', 40),
    ('talent_access', 'Talent Access', 50),
]

PACKAGES = [
    {
        'slug': 'silver',
        'name': 'Silver Sponsor',
        'tagline': 'Solid exposure · standard booth package',
        'price_display': '₵5,000',
        'sort_order': 10,
        'benefit_values': {
            'exhibition_booth': '3×3m Standard',
            'speaking_slot': '✕',
            'logo_placement': 'Marketing Assets',
            'vip_tickets': '2',
            'talent_access': '✕',
        },
    },
    {
        'slug': 'gold',
        'name': 'Gold Sponsor',
        'tagline': 'Strong presence · keynote & premium booth',
        'price_display': '₵15,000',
        'sort_order': 20,
        'highlight_column': True,
        'benefit_values': {
            'exhibition_booth': '6×3m Premium',
            'speaking_slot': '15 Min Keynote',
            'logo_placement': 'Premium Assets',
            'vip_tickets': '5',
            'talent_access': '✔',
        },
    },
    {
        'slug': 'diamond',
        'name': 'Diamond Sponsor',
        'tagline': 'Premier visibility · main stage & branding',
        'price_display': '₵35,000',
        'sort_order': 30,
        'benefit_values': {
            'exhibition_booth': '9×6m Custom Island',
            'speaking_slot': '30 Min + Panel',
            'logo_placement': 'Primary Branding',
            'vip_tickets': '15',
            'talent_access': '✔',
        },
    },
    {
        'slug': 'custom',
        'name': 'Custom Sponsorship',
        'tagline': 'Tailored package — tell us your goals',
        'price_display': '',
        'sort_order': 40,
        'show_in_comparison_table': False,
        'benefit_values': {},
    },
]


class Command(BaseCommand):
    help = 'Seed sponsorship tiers and comparison table rows (also run via: python manage.py seed)'

    def handle(self, *args, **options):
        for key, label, sort_order in BENEFIT_ROWS:
            SponsorshipBenefitRow.objects.update_or_create(
                key=key,
                defaults={'label': label, 'sort_order': sort_order},
            )

        for spec in PACKAGES:
            slug = spec['slug']
            defaults = {
                'name': spec['name'],
                'tagline': spec['tagline'],
                'price_display': spec['price_display'],
                'sort_order': spec['sort_order'],
                'benefit_values': spec['benefit_values'],
                'show_on_inquiry_form': True,
                'show_in_comparison_table': spec.get('show_in_comparison_table', True),
                'highlight_column': spec.get('highlight_column', False),
                'is_published': True,
            }
            SponsorshipPackage.objects.update_or_create(slug=slug, defaults=defaults)

        self.stdout.write(self.style.SUCCESS('Sponsorship packages and benefit rows seeded'))
