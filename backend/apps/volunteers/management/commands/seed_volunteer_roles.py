from django.core.management.base import BaseCommand

from apps.volunteers.models import VolunteerRole, VolunteerRoleCategory

ROLES = [
    ('workshop-assistant', 'Workshop Assistant', VolunteerRoleCategory.EVENT_SUPPORT,
     'Support instructors during coding, AI, and skills sessions.'),
    ('guest-relations', 'Guest Relations & Registration', VolunteerRoleCategory.EVENT_SUPPORT,
     'Welcome attendees, support check-in, and guide guests.'),
    ('event-logistics', 'Event Logistics & Operations', VolunteerRoleCategory.EVENT_SUPPORT,
     'Manage venue flow, setup, equipment, and on-the-day coordination.'),
    ('community-outreach', 'Community Outreach Ambassador', VolunteerRoleCategory.EVENT_SUPPORT,
     'Support outreach to schools, youth groups, and community networks.'),
    ('graphic-design', 'Graphic Design Volunteer', VolunteerRoleCategory.CREATIVE_MEDIA,
     'Create flyers, social graphics, and branded visuals.'),
    ('motion-design', 'Motion Design Volunteer', VolunteerRoleCategory.CREATIVE_MEDIA,
     'Develop animated content and promo visuals.'),
    ('videography', 'Videography Volunteer', VolunteerRoleCategory.CREATIVE_MEDIA,
     'Capture event highlights, workshops, and interviews.'),
    ('photography', 'Photography Volunteer', VolunteerRoleCategory.CREATIVE_MEDIA,
     'Produce visual coverage of speakers and activities.'),
    ('video-editing', 'Video Editing Volunteer', VolunteerRoleCategory.CREATIVE_MEDIA,
     'Turn raw footage into recap videos and promotional edits.'),
    ('social-media', 'Social Media Content Creator', VolunteerRoleCategory.CREATIVE_MEDIA,
     'Plan and create platform-ready posts and campaign content.'),
]


class Command(BaseCommand):
    help = 'Seed volunteer roles (also run via: python manage.py seed)'

    def handle(self, *args, **options):
        created = 0
        for slug, name, category, description in ROLES:
            _, was_created = VolunteerRole.objects.update_or_create(
                slug=slug,
                defaults={'name': name, 'category': category, 'description': description, 'is_active': True},
            )
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Seeded volunteer roles ({created} new)'))
