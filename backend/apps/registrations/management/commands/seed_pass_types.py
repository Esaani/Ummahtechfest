from django.core.management.base import BaseCommand

from apps.registrations.models import PassFlow, PassType

PASSES = [
    {
        'slug': 'delegate',
        'name': 'Delegate Pass',
        'flow': PassFlow.OPEN,
        'description': "Full Summit access for fintech professionals, ecosystem builders, corporate delegates, and anyone shaping Africa's digital economy.",
        'sort_order': 10,
        'icon': 'badge',
        'tag': 'Open',
        'features': ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
        'cta_label': 'Register as Delegate',
        'display_color': 'primary-fixed',
        'is_wired': True,
    },
    {
        'slug': 'policy',
        'name': 'Policy Pass',
        'flow': PassFlow.APPROVAL,
        'description': 'For government officials, policymakers, central bank staff, regulators, multilateral agencies, DFIs, and non-profit foundations.',
        'sort_order': 20,
        'icon': 'account_balance',
        'tag': 'Approval',
        'features': ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
        'cta_label': 'Apply for Policy Pass',
        'display_color': 'secondary',
        'is_outline_style': True,
        'is_wired': True,
    },
    {
        'slug': 'investor',
        'name': 'Investor Pass',
        'flow': PassFlow.APPROVAL,
        'description': 'For venture capitalists, private equity, angel investors, impact investors, and investment fund managers seeking deal flow in Africa.',
        'sort_order': 30,
        'icon': 'monitoring',
        'tag': 'Approval',
        'features': ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
        'cta_label': 'Apply for Investor Pass',
        'display_color': 'secondary',
        'is_outline_style': True,
        'is_wired': True,
    },
    {
        'slug': 'startup',
        'name': 'Startup Pass',
        'flow': PassFlow.OPEN,
        'description': 'For founders and co-founders of early-stage startups (incorporated within the last 5 years).',
        'sort_order': 40,
        'icon': 'rocket_launch',
        'tag': 'Open',
        'features': ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
        'cta_label': 'Register as Startup',
        'display_color': 'primary-fixed',
        'is_wired': True,
    },
    {
        'slug': 'academic',
        'name': 'Academic Pass',
        'flow': PassFlow.APPROVAL,
        'description': 'For professors, researchers, and staff from universities. Valid institutional credentials required for processing.',
        'sort_order': 50,
        'icon': 'school',
        'tag': 'Approval',
        'features': ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
        'cta_label': 'Apply for Academic Pass',
        'display_color': 'secondary',
        'is_outline_style': True,
        'is_wired': True,
    },
    {
        'slug': 'student',
        'name': 'Student Pass',
        'flow': PassFlow.OPEN,
        'description': 'For enrolled students with valid student ID at check-in.',
        'sort_order': 60,
        'icon': 'person',
        'tag': 'Open',
        'features': ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
        'cta_label': 'Register as Student',
        'display_color': 'primary-fixed',
        'is_wired': True,
    },
    {
        'slug': 'media',
        'name': 'Media Pass',
        'flow': PassFlow.APPROVAL,
        'description': 'For accredited journalists and media professionals.',
        'sort_order': 70,
        'icon': 'mic',
        'tag': 'Approval',
        'features': ['Main Stage Plenary', 'Press lounge access'],
        'cta_label': 'Apply for Media Pass',
        'display_color': 'secondary',
        'is_outline_style': True,
        'is_wired': False,
        'show_on_signup': True,
    },
]


class Command(BaseCommand):
    help = 'Seed event pass types (also run via: python manage.py seed)'

    def handle(self, *args, **options):
        for spec in PASSES:
            data = dict(spec)
            slug = data.pop('slug')
            flow = data.get('flow', PassFlow.OPEN)
            # Open (paid) passes: keep visible on /signup but block completion until ticket sales — flip in admin when ready.
            is_open_default = False if flow == PassFlow.OPEN else True
            PassType.objects.update_or_create(
                slug=slug,
                defaults={
                    **data,
                    'is_active': True,
                    'is_open_for_registration': is_open_default,
                    'show_on_signup': data.get('show_on_signup', True),
                },
            )
        self.stdout.write(self.style.SUCCESS('Pass types seeded'))
