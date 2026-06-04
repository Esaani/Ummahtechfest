from django.test import RequestFactory, TestCase
from rest_framework import serializers

from common.security import HoneypotSerializerMixin, check_honeypot


class _SampleSerializer(HoneypotSerializerMixin, serializers.Serializer):
    name = serializers.CharField()


class HoneypotLoggingTest(TestCase):
    def test_honeypot_logs_and_rejects(self):
        request = RequestFactory().post('/api/v1/outreach/speaker-applications/')
        with self.assertLogs('security', level='WARNING') as security_logs:
            with self.assertRaises(serializers.ValidationError):
                _SampleSerializer(
                    data={'name': 'x', 'website': 'filled'},
                    context={'request': request},
                ).is_valid(raise_exception=True)
        self.assertTrue(any('honeypot_triggered' in m for m in security_logs.output))

    def test_check_honeypot_helper_logs(self):
        request = RequestFactory().post('/api/v1/test/')
        with self.assertLogs('security', level='WARNING'):
            with self.assertRaises(serializers.ValidationError):
                check_honeypot({'website': 'bot'}, request=request)
