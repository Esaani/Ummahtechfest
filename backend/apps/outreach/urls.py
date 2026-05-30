from django.urls import path

from apps.outreach import admin_views, views

urlpatterns = [
    path('options/', views.OutreachOptionsView.as_view(), name='outreach-options'),
    path('sponsor-inquiries/', views.SponsorInquiryCreateView.as_view(), name='sponsor-inquiry-create'),
    path('speaker-applications/', views.SpeakerApplicationCreateView.as_view(), name='speaker-application-create'),
    path('ticket-waitlist/', views.TicketWaitlistCreateView.as_view(), name='ticket-waitlist-create'),
    path('admin/sponsor-inquiries/', admin_views.AdminSponsorInquiryListView.as_view(), name='admin-sponsor-inquiries'),
    path(
        'admin/sponsor-inquiries/<uuid:inquiry_id>/',
        admin_views.AdminSponsorInquiryDetailView.as_view(),
        name='admin-sponsor-inquiry-detail',
    ),
    path('admin/speaker-applications/', admin_views.AdminSpeakerApplicationListView.as_view(), name='admin-speaker-applications'),
    path(
        'admin/speaker-applications/<uuid:application_id>/',
        admin_views.AdminSpeakerApplicationDetailView.as_view(),
        name='admin-speaker-application-detail',
    ),
    path('admin/ticket-waitlist/', admin_views.AdminTicketWaitlistListView.as_view(), name='admin-ticket-waitlist'),
    path(
        'admin/ticket-waitlist/<uuid:entry_id>/',
        admin_views.AdminTicketWaitlistDetailView.as_view(),
        name='admin-ticket-waitlist-detail',
    ),
]
