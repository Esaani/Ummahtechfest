import logging

from django.core.cache import cache

logger = logging.getLogger('ummah_tech_fest')

CACHE_VERSION = 'v1'
ROLES_CACHE_TIMEOUT = 300


class VolunteerRoleCacheService:
    @classmethod
    def get_cache_key(cls):
        return f'volunteer_roles:active:{CACHE_VERSION}'

    @classmethod
    def get_active_roles(cls):
        from apps.volunteers.models import VolunteerRole

        cache_key = cls.get_cache_key()
        roles = cache.get(cache_key)
        if roles is None:
            logger.info('cache_miss key=%s', cache_key)
            roles = list(
                VolunteerRole.objects.filter(is_active=True).order_by('name').values(
                    'id', 'slug', 'name', 'category', 'description'
                )
            )
            cache.set(cache_key, roles, timeout=ROLES_CACHE_TIMEOUT)
            logger.info('cache_set key=%s', cache_key)
        else:
            logger.info('cache_hit key=%s', cache_key)
        return roles

    @classmethod
    def invalidate(cls):
        cache_key = cls.get_cache_key()
        cache.delete(cache_key)
        logger.info('cache_invalidated key=%s', cache_key)
