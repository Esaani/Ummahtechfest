from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from common.media_views import PublicMediaView
from common.views import HealthCheckView

urlpatterns = [
    path('api/v1/health/', HealthCheckView.as_view(), name='health'),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/volunteers/', include('apps.volunteers.urls')),
    path('api/v1/registrations/', include('apps.registrations.urls')),
    path('api/v1/cms/', include('apps.cms.urls')),
    path('api/v1/outreach/', include('apps.outreach.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    re_path(r'^media/(?P<path>.*)$', PublicMediaView.as_view(), name='public-media'),
]

if settings.ENABLE_DJANGO_ADMIN:
    admin_path = settings.DJANGO_ADMIN_URL_PATH.strip('/') + '/'
    urlpatterns.insert(0, path(admin_path, admin.site.urls))
