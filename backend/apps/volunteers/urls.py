from django.urls import path

from apps.volunteers.admin_views import (
    AdminVolunteerApplicationDetailView,
    AdminVolunteerApplicationListView,
    AdminVolunteerRoleListView,
)
from apps.volunteers.views import (
    VolunteerApplicationCreateView,
    VolunteerApplicationEligibilityView,
    VolunteerApplicationMeView,
    VolunteerRoleListView,
)

urlpatterns = [
    path('roles/', VolunteerRoleListView.as_view(), name='volunteer-roles'),
    path('applications/eligibility/', VolunteerApplicationEligibilityView.as_view(), name='volunteer-eligibility'),
    path('applications/', VolunteerApplicationCreateView.as_view(), name='volunteer-application-create'),
    path('applications/me/', VolunteerApplicationMeView.as_view(), name='volunteer-application-me'),
    path('admin/applications/', AdminVolunteerApplicationListView.as_view(), name='volunteer-admin-applications'),
    path(
        'admin/applications/<uuid:application_id>/',
        AdminVolunteerApplicationDetailView.as_view(),
        name='volunteer-admin-application-detail',
    ),
    path('admin/roles/', AdminVolunteerRoleListView.as_view(), name='volunteer-admin-roles'),
]
