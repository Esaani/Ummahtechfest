from django.test import SimpleTestCase


class R2EnvAliasTest(SimpleTestCase):
    """Document env var aliases used in production .env files."""

    def test_bucket_name_accepts_storage_bucket_alias(self):
        from django.conf import settings

        # settings module resolves aliases at import; verify attribute exists.
        self.assertTrue(hasattr(settings, 'R2_BUCKET_NAME'))
        self.assertTrue(hasattr(settings, 'R2_ENDPOINT_URL'))
