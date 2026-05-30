from django.urls import path

from apps.registrations.views import (
    AdminPassTypeDetailView,
    AdminPassTypeListCreateView,
    OpenPassRegistrationCreateView,
    PassRegistrationMeView,
    PassTypeListView,
    SpecialAccessRegistrationCreateView,
)

urlpatterns = [
    path('pass-types/', PassTypeListView.as_view(), name='pass-types'),
    path('admin/pass-types/', AdminPassTypeListCreateView.as_view(), name='admin-pass-types'),
    path('admin/pass-types/<uuid:pass_type_id>/', AdminPassTypeDetailView.as_view(), name='admin-pass-type-detail'),
    path('me/', PassRegistrationMeView.as_view(), name='registration-me'),
    path('open/', OpenPassRegistrationCreateView.as_view(), name='registration-open'),
    path('special-access/', SpecialAccessRegistrationCreateView.as_view(), name='registration-special-access'),
]
