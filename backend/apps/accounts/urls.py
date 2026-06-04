from django.urls import path

from apps.accounts.admin_views import (
    AdminParticipantInviteView,
    AdminStaffInviteView,
    AdminUserDetailView,
    AdminUserListView,
    ParticipantInviteAcceptView,
    StaffInviteAcceptView,
)
from apps.accounts.views import (
    ConfirmSignupOtpView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RefreshTokenView,
    RegisterView,
    ResendSignupOtpView,
    SendSignupOtpView,
)

urlpatterns = [
    path('signup/verify-email/send/', SendSignupOtpView.as_view(), name='auth-signup-send-otp'),
    path('signup/verify-email/confirm/', ConfirmSignupOtpView.as_view(), name='auth-signup-confirm-otp'),
    path('signup/verify-email/resend/', ResendSignupOtpView.as_view(), name='auth-signup-resend-otp'),
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', RefreshTokenView.as_view(), name='auth-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='auth-password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    path('admin/users/', AdminUserListView.as_view(), name='auth-admin-users'),
    path('admin/users/invite/', AdminStaffInviteView.as_view(), name='auth-admin-user-invite'),
    path('admin/users/<uuid:user_id>/', AdminUserDetailView.as_view(), name='auth-admin-user-detail'),
    path('staff-invite/accept/', StaffInviteAcceptView.as_view(), name='auth-staff-invite-accept'),
    path('admin/participants/invite/', AdminParticipantInviteView.as_view(), name='auth-admin-participant-invite'),
    path('participant-invite/accept/', ParticipantInviteAcceptView.as_view(), name='auth-participant-invite-accept'),
]
