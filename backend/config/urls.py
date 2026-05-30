from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from common.views import HealthCheckView

urlpatterns = [
    path('api/v1/health/', HealthCheckView.as_view(), name='health'),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/volunteers/', include('apps.volunteers.urls')),
    path('api/v1/registrations/', include('apps.registrations.urls')),
    path('api/v1/cms/', include('apps.cms.urls')),
    path('api/v1/outreach/', include('apps.outreach.urls')),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
]

if settings.ENABLE_DJANGO_ADMIN:
    admin_path = settings.DJANGO_ADMIN_URL_PATH.strip('/') + '/'
    urlpatterns.insert(0, path(admin_path, admin.site.urls))

# Uploaded CMS files on disk (when R2 is not configured). With R2, files use the public CDN URL.
if not settings.USE_R2_STORAGE:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
