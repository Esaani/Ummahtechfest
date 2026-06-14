from django.urls import path

from apps.cms import views

urlpatterns = [
    path('sections/', views.PublicSectionListView.as_view(), name='cms-sections-list'),
    path('sections/<slug:slug>/', views.PublicSectionDetailView.as_view(), name='cms-section-detail'),
    path('admin/sections/', views.AdminSectionListCreateView.as_view(), name='cms-admin-sections'),
    path('admin/sections/<uuid:section_id>/', views.AdminSectionDetailView.as_view(), name='cms-admin-section-detail'),
    path('admin/media/', views.AdminMediaListCreateView.as_view(), name='cms-admin-media'),
    path('admin/media/<uuid:asset_id>/', views.AdminMediaDetailView.as_view(), name='cms-admin-media-detail'),
    path('speakers/', views.PublicSpeakerListView.as_view(), name='cms-speakers-list'),
    path('sponsors/', views.PublicSponsorListView.as_view(), name='cms-sponsors-list'),
    path('admin/speakers/', views.AdminSpeakerListCreateView.as_view(), name='cms-admin-speakers'),
    path('admin/speakers/<uuid:speaker_id>/', views.AdminSpeakerDetailView.as_view(), name='cms-admin-speaker-detail'),
    path('admin/sponsors/', views.AdminSponsorListCreateView.as_view(), name='cms-admin-sponsors'),
    path('admin/sponsors/<uuid:sponsor_id>/', views.AdminSponsorDetailView.as_view(), name='cms-admin-sponsor-detail'),
    path('sponsorship/', views.PublicSponsorshipView.as_view(), name='cms-sponsorship'),
    path('admin/sponsorship/packages/', views.AdminSponsorshipPackageListCreateView.as_view(), name='cms-admin-sponsorship-packages'),
    path('admin/sponsorship/packages/<uuid:package_id>/', views.AdminSponsorshipPackageDetailView.as_view(), name='cms-admin-sponsorship-package-detail'),
    path('admin/sponsorship/benefit-rows/', views.AdminSponsorshipBenefitRowListCreateView.as_view(), name='cms-admin-sponsorship-benefit-rows'),
    path('admin/sponsorship/benefit-rows/<uuid:row_id>/', views.AdminSponsorshipBenefitRowDetailView.as_view(), name='cms-admin-sponsorship-benefit-row-detail'),
    path('schedule/', views.PublicScheduleListView.as_view(), name='cms-schedule-list'),
    path('admin/schedule/', views.AdminScheduleListCreateView.as_view(), name='cms-admin-schedule'),
    path('admin/schedule/<uuid:session_id>/', views.AdminScheduleDetailView.as_view(), name='cms-admin-schedule-detail'),
    path('voices/', views.PublicAttendeeVoiceListView.as_view(), name='cms-voices-list'),
    path('admin/voices/', views.AdminAttendeeVoiceListCreateView.as_view(), name='cms-admin-voices'),
    path('admin/voices/<uuid:voice_id>/', views.AdminAttendeeVoiceDetailView.as_view(), name='cms-admin-voice-detail'),
]
