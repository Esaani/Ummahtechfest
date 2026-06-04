from django.core.management import call_command
from django.test import TestCase

from apps.volunteers.models import VolunteerRole, VolunteerRoleCategory

TECHNICAL_ROLE_NAMES = (
    'Coding Trainer',
    'AI & Emerging Tech Facilitator',
    'Tech Mentor',
    'STEM Education Volunteer',
    'Technical Support Volunteer',
)


class SeedVolunteerRolesTest(TestCase):
    def test_seed_includes_technical_and_training_roles(self):
        call_command('seed_volunteer_roles', verbosity=0)

        tech_roles = VolunteerRole.objects.filter(
            category=VolunteerRoleCategory.TECHNICAL_TRAINING,
            is_active=True,
        )
        self.assertEqual(tech_roles.count(), len(TECHNICAL_ROLE_NAMES))
        self.assertEqual(
            set(tech_roles.values_list('name', flat=True)),
            set(TECHNICAL_ROLE_NAMES),
        )
