from django.apps import AppConfig


class CmsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.cms'
    label = 'cms'

    def ready(self):
        from apps.cms import signals  # noqa: F401
