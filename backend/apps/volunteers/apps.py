from django.apps import AppConfig


class VolunteersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.volunteers'
    label = 'volunteers'

    def ready(self):
        import apps.volunteers.signals  # noqa: F401
