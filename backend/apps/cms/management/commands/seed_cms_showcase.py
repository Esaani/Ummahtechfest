from django.core.management.base import BaseCommand

from apps.cms.models import FeaturedSponsor, SponsorTier

# Featured speakers are managed in Admin → Speakers (no demo seed).

# Demo sponsor names — only inserted when the table is empty (first seed on a fresh DB).
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
        if FeaturedSponsor.objects.exists():
            self.stdout.write('Skipped sponsor logos — entries already exist (manage in Admin → Sponsors → Homepage logos)')
        else:
            for name, order in GLOBAL_PARTNERS:
                FeaturedSponsor.objects.create(
                    name=name,
                    tier=SponsorTier.GLOBAL_PARTNER,
                    sort_order=order,
                    is_published=True,
                )
            for name, order in SPONSORS:
                FeaturedSponsor.objects.create(
                    name=name,
                    tier=SponsorTier.SPONSOR,
                    sort_order=order,
                    is_published=True,
                )
            self.stdout.write(self.style.SUCCESS('Created demo sponsor logos (first run only)'))

        self.stdout.write(self.style.SUCCESS('CMS showcase seed finished'))
