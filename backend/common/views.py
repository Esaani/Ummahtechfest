from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        db_ok = False
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
            db_ok = True
        except Exception:
            pass
        status_label = 'ok' if db_ok else 'degraded'
        code = 200 if db_ok else 503
        return Response({'data': {'status': status_label, 'database': db_ok}}, status=code)
