"""
Canonical list of database seeders.

When you add `management/commands/seed_*.py`, register it in SEEDERS below
(in dependency order). The master `python manage.py seed` command runs each
entry via `manage.py <command>` — all seeders must be idempotent.

Registered commands (as of last audit):
  - seed_pass_types
  - seed_volunteer_roles
  - seed_cms_sections
  - seed_cms_showcase
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class SeederSpec:
    """One entry in the seed pipeline."""

    key: str
    command: str
    description: str


# Order matters: pass types before registrations; CMS can run anytime.
SEEDERS: tuple[SeederSpec, ...] = (
    SeederSpec('pass_types', 'seed_pass_types', 'Event pass types (delegate, student, policy, …)'),
    SeederSpec('volunteer_roles', 'seed_volunteer_roles', 'Volunteer pathways / roles'),
    SeederSpec('cms_sections', 'seed_cms_sections', 'CMS homepage and page sections'),
    SeederSpec('cms_showcase', 'seed_cms_showcase', 'Homepage featured speakers and sponsors'),
    SeederSpec('schedule', 'seed_schedule', 'Homepage and schedule page agenda items'),
    SeederSpec('sponsorship', 'seed_sponsorship', 'Sponsor page tiers, comparison table, and inquiry form options'),
)

SEEDER_KEYS = frozenset(s.key for s in SEEDERS)
