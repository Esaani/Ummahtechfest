import logging

from django.core.cache import cache

logger = logging.getLogger('ummah_tech_fest')

CACHE_VERSION = 'v1'
SECTIONS_CACHE_TIMEOUT = 300


class CmsCacheService:
    @classmethod
    def sections_key(cls, page=None):
        page_part = page or 'all'
        return f'cms:sections:{page_part}:{CACHE_VERSION}'

    @classmethod
    def speakers_key(cls):
        return f'cms:speakers:{CACHE_VERSION}'

    @classmethod
    def sponsors_key(cls, tier=None):
        tier_part = tier or 'all'
        return f'cms:sponsors:{tier_part}:{CACHE_VERSION}'

    @classmethod
    def schedule_key(cls, home_only=False):
        return f'cms:schedule:{"home" if home_only else "all"}:{CACHE_VERSION}'

    @classmethod
    def voices_key(cls):
        return f'cms:voices:{CACHE_VERSION}'

    @classmethod
    def sponsorship_key(cls):
        return f'cms:sponsorship:{CACHE_VERSION}'

    @classmethod
    def invalidate_sections(cls, page=None):
        if page:
            cache.delete(cls.sections_key(page))
        cache.delete(cls.sections_key(None))
        logger.info('cms_cache_invalidated page=%s', page or 'all')

    @classmethod
    def invalidate_speakers(cls):
        cache.delete(cls.speakers_key())
        logger.info('cms_cache_invalidated resource=speakers')

    @classmethod
    def invalidate_sponsors(cls):
        cache.delete(cls.sponsors_key())
        cache.delete(cls.sponsors_key('global_partner'))
        cache.delete(cls.sponsors_key('sponsor'))
        logger.info('cms_cache_invalidated resource=sponsors')

    @classmethod
    def invalidate_schedule(cls):
        cache.delete(cls.schedule_key(home_only=False))
        cache.delete(cls.schedule_key(home_only=True))
        logger.info('cms_cache_invalidated resource=schedule')

    @classmethod
    def invalidate_voices(cls):
        cache.delete(cls.voices_key())
        logger.info('cms_cache_invalidated resource=voices')

    @classmethod
    def invalidate_sponsorship(cls):
        cache.delete(cls.sponsorship_key())
        logger.info('cms_cache_invalidated resource=sponsorship')
