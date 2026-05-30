import logging
from unittest.mock import patch

from django.db import IntegrityError
from django.test import RequestFactory, TestCase
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView

from common.exceptions import custom_exception_handler


class BoomView(APIView):
    def get(self, request):
        raise Exception('secret internal path /app/backend/secret.py')


class TestSanitizedExceptions(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def _handle(self, exc, request=None):
        request = request or self.factory.get('/api/v1/test/')
        request.request_id = 'test-req-id'
        return custom_exception_handler(exc, {'request': request, 'view': None})

    def test_validation_error_no_traceback(self):
        response = self._handle(ValidationError({'email': ['Invalid']}))
        body = str(response.data)
        self.assertNotIn('traceback', body.lower())
        self.assertNotIn('/app/', body)
        self.assertEqual(response.data['error']['code'], 'VALIDATION_ERROR')

    def test_integrity_error_sanitized(self):
        response = self._handle(IntegrityError('duplicate key violates unique constraint users_email_key'))
        body = str(response.data)
        self.assertNotIn('duplicate key', body)
        self.assertNotIn('users_email', body)
        self.assertEqual(response.data['error']['code'], 'SERVICE_UNAVAILABLE')

    def test_unhandled_exception_sanitized(self):
        with self.assertLogs('ummah_tech_fest', level='ERROR'):
            response = self._handle(Exception('secret internal'))
        body = str(response.data)
        self.assertNotIn('secret internal', body)
        self.assertEqual(response.data['error']['message'], 'Something went wrong. Please try again later.')

    def test_generic_internal_message(self):
        response = self._handle(Exception('boom'))
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.data['error']['code'], 'INTERNAL_ERROR')
