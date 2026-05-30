from django.core.management.base import BaseCommand

from apps.cms.models import FeaturedSpeaker, FeaturedSponsor, SponsorTier

SPEAKERS = [
    ('Ibrahim Mansour', 'CTO @ HALAL AI', 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=600&auto=format&fit=crop', 10),
    ('Amina Asante', 'Lead Dev @ EthioChain', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop', 20),
    ('Yusuf Osei', 'Founder @ AccraData', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop', 30),
]

GLOBAL_PARTNERS = [
    ('Google', 10),
    ('Microsoft', 20),
    ('Amazon Web Services', 30),
    ('Meta', 40),
    ('IBM', 50),
    ('Oracle', 60),
]

SPONSORS = [
    ('Flutterwave', 10),
    ('Paystack', 20),
    ('Hubtel', 30),
]


class Command(BaseCommand):
    help = 'Seed homepage featured speakers and sponsors (also run via: python manage.py seed)'

    def handle(self, *args, **options):
        for name, role, image_url, order in SPEAKERS:
            FeaturedSpeaker.objects.update_or_create(
                name=name,
                defaults={
                    'role': role,
                    'image_url': image_url,
                    'sort_order': order,
                    'is_published': True,
                },
            )
        for name, order in GLOBAL_PARTNERS:
            FeaturedSponsor.objects.update_or_create(
                name=name,
                tier=SponsorTier.GLOBAL_PARTNER,
                defaults={'sort_order': order, 'is_published': True},
            )
        for name, order in SPONSORS:
            FeaturedSponsor.objects.update_or_create(
                name=name,
                tier=SponsorTier.SPONSOR,
                defaults={'sort_order': order, 'is_published': True},
            )
        self.stdout.write(self.style.SUCCESS('CMS showcase (speakers & sponsors) seeded'))
