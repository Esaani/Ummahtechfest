from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.volunteers.models import VolunteerRole
from apps.volunteers.services import VolunteerRoleCacheService


@receiver([post_save, post_delete], sender=VolunteerRole)
def invalidate_volunteer_roles_cache(sender, **kwargs):
    try:
        VolunteerRoleCacheService.invalidate()
    except Exception:
        pass
