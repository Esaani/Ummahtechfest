import logging
from django.core.cache import cache

logger = logging.getLogger('ummah_tech_fest')

DASHBOARD_STATS_KEY = 'admin:dashboard:stats:v1'
DASHBOARD_TTL = 3600  # 1 hour

class DashboardCacheService:
    @staticmethod
    def get_stats():
        return cache.get(DASHBOARD_STATS_KEY)

    @staticmethod
    def set_stats(data):
        cache.set(DASHBOARD_STATS_KEY, data, DASHBOARD_TTL)
        logger.info('dashboard_stats_cached_updated')

    @staticmethod
    def invalidate():
        cache.delete(DASHBOARD_STATS_KEY)
        logger.info('dashboard_stats_cache_invalidated')
