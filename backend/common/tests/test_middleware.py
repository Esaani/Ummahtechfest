from django.test import RequestFactory, TestCase

from common.middleware import RequestLoggingMiddleware


class RequestLoggingMiddlewareTest(TestCase):
    def test_adds_request_id_header(self):
        factory = RequestFactory()
        request = factory.get('/api/v1/health/')

        def get_response(req):
            from django.http import HttpResponse
            return HttpResponse('ok')

        middleware = RequestLoggingMiddleware(get_response)
        response = middleware(request)
        self.assertIn('X-Request-ID', response)
        self.assertTrue(len(response['X-Request-ID']) > 0)
