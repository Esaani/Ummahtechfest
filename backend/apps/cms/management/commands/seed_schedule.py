from django.core.management.base import BaseCommand

from apps.cms.models import ScheduleItemType, ScheduleSession, ScheduleTrack

SCHEDULE = [
    {
        'slug': 'opening-keynote',
        'event_day': 1,
        'day_label': '01',
        'day_date_label': 'Jan 15, 2026',
        'starts_at_time': '09:00',
        'time_label': '09:00 AM — 10:30 AM',
        'title': 'Genesis: Opening Keynote',
        'subtitle': 'Building Ethical Tech for the Ummah',
        'track': ScheduleTrack.MAIN_STAGE,
        'location': 'Main Stage (Auditorium A)',
        'show_on_home': True,
        'sort_order': 10,
        'is_live_highlight': False,
    },
    {
        'slug': 'hackathon-begins',
        'event_day': 2,
        'day_label': '02',
        'day_date_label': 'Jan 16, 2026',
        'starts_at_time': '10:00',
        'time_label': 'LIVE NOW',
        'title': 'The Hackathon Begins',
        'subtitle': '24 Hours of Intensive Building',
        'track': ScheduleTrack.COMMUNITY,
        'show_on_home': True,
        'sort_order': 20,
        'is_live_highlight': True,
    },
    {
        'slug': 'future-horizons',
        'event_day': 3,
        'day_label': '03',
        'day_date_label': 'Jan 17, 2026',
        'starts_at_time': '18:00',
        'time_label': '06:00 PM',
        'title': 'Future Horizons',
        'subtitle': 'Awards & Closing Iftar',
        'track': ScheduleTrack.MAIN_STAGE,
        'show_on_home': True,
        'sort_order': 30,
    },
]


class Command(BaseCommand):
    help = 'Seed homepage schedule preview items (also run via: python manage.py seed)'

    def handle(self, *args, **options):
        for spec in SCHEDULE:
            slug = spec['slug']
            ScheduleSession.objects.update_or_create(
                slug=slug,
                defaults={
                    **spec,
                    'item_type': ScheduleItemType.SESSION,
                    'is_published': True,
                },
            )
        self.stdout.write(self.style.SUCCESS('Schedule sessions seeded'))
