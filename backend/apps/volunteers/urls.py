from django.urls import path

from apps.volunteers.admin_views import (
    AdminAcceptedVolunteerListView,
    AdminVolunteerAnnouncementDetailView,
    AdminVolunteerAnnouncementListView,
    AdminVolunteerApplicationDetailView,
    AdminVolunteerApplicationListView,
    AdminVolunteerRoleListView,
    AdminVolunteerTaskDetailView,
    AdminVolunteerTaskListView,
)
from apps.volunteers.views import (
    VolunteerApplicationCreateView,
    VolunteerApplicationEligibilityView,
    VolunteerApplicationMeView,
    VolunteerPortalAnnouncementListView,
    VolunteerPortalSummaryView,
    VolunteerPortalTaskListView,
    VolunteerPortalTaskUpdateView,
    VolunteerRoleListView,
)

urlpatterns = [
    path('roles/', VolunteerRoleListView.as_view(), name='volunteer-roles'),
    path('applications/eligibility/', VolunteerApplicationEligibilityView.as_view(), name='volunteer-eligibility'),
    path('applications/', VolunteerApplicationCreateView.as_view(), name='volunteer-application-create'),
    path('applications/me/', VolunteerApplicationMeView.as_view(), name='volunteer-application-me'),

    # Volunteer portal (accepted volunteers only)
    path('portal/', VolunteerPortalSummaryView.as_view(), name='volunteer-portal-summary'),
    path('portal/tasks/', VolunteerPortalTaskListView.as_view(), name='volunteer-portal-tasks'),
    path('portal/tasks/<uuid:task_id>/', VolunteerPortalTaskUpdateView.as_view(), name='volunteer-portal-task-update'),
    path('portal/announcements/', VolunteerPortalAnnouncementListView.as_view(), name='volunteer-portal-announcements'),

    # Admin
    path('admin/applications/', AdminVolunteerApplicationListView.as_view(), name='volunteer-admin-applications'),
    path(
        'admin/applications/<uuid:application_id>/',
        AdminVolunteerApplicationDetailView.as_view(),
        name='volunteer-admin-application-detail',
    ),
    path('admin/roles/', AdminVolunteerRoleListView.as_view(), name='volunteer-admin-roles'),
    path('admin/volunteers/', AdminAcceptedVolunteerListView.as_view(), name='volunteer-admin-accepted-list'),
    path('admin/tasks/', AdminVolunteerTaskListView.as_view(), name='volunteer-admin-tasks'),
    path('admin/tasks/<uuid:task_id>/', AdminVolunteerTaskDetailView.as_view(), name='volunteer-admin-task-detail'),
    path('admin/announcements/', AdminVolunteerAnnouncementListView.as_view(), name='volunteer-admin-announcements'),
    path(
        'admin/announcements/<uuid:announcement_id>/',
        AdminVolunteerAnnouncementDetailView.as_view(),
        name='volunteer-admin-announcement-detail',
    ),
]
