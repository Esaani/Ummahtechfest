from django.apps import apps
from django.test import TestCase


class TestDbTableConvention(TestCase):
    def test_all_concrete_models_have_explicit_db_table(self):
        skip = {'Session', 'ContentType', 'Permission', 'Group', 'LogEntry'}
        for model in apps.get_models():
            if model._meta.abstract or model.__name__ in skip:
                continue
            if model._meta.app_label in ('admin', 'auth', 'contenttypes', 'sessions', 'token_blacklist'):
                continue
            db_table = model._meta.db_table
            self.assertTrue(db_table, f'{model.__name__} missing db_table')
            self.assertNotRegex(db_table, r'^(accounts|volunteers)_')
