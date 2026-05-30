from django.apps import AppConfig


class CommonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'common'

    def ready(self):
        import logging

        from django.conf import settings

        logger = logging.getLogger('ummah_tech_fest')
        logger.info(
            'storage_config use_r2=%s media_url=%s',
            settings.USE_R2_STORAGE,
            settings.MEDIA_URL,
        )

