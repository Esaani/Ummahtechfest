import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import AdminRole, StaffInvite
from common.tasks import send_email_task
from common.telegram_monitor import monitor_event

logger = logging.getLogger('ummah_tech_fest')
User = get_user_model()


class StaffInviteError(Exception):
    def __init__(self, message, code='STAFF_INVITE_ERROR'):
        self.message = message
        self.code = code
        super().__init__(message)


def _invite_ttl():
    hours = getattr(settings, 'STAFF_INVITE_EXPIRY_HOURS', 72)
    return timedelta(hours=hours)


def _frontend_invite_url(invite_id, token):
    base = getattr(settings, 'FRONTEND_URL', settings.SITE_URL).rstrip('/')
    return f'{base}/accept-invite?id={invite_id}&token={token}'


@transaction.atomic
def create_staff_invite(email, admin_role, invited_by):
    email = email.lower().strip()
    if admin_role not in AdminRole.values:
        raise StaffInviteError('Invalid admin role.', 'INVALID_ROLE')

    existing = User.objects.filter(email__iexact=email).first()
    if existing:
        if existing.is_superuser:
            raise StaffInviteError('This email belongs to a superadmin account.', 'EMAIL_IN_USE')
        if existing.admin_role and existing.is_active:
            raise StaffInviteError('This user already has admin portal access.', 'EMAIL_IN_USE')
        user = existing
        user.admin_role = admin_role
        user.is_staff = True
        user.is_active = True
        user.set_unusable_password()
        user.save(update_fields=['admin_role', 'is_staff', 'is_active', 'password', 'updated_at'])
    else:
        user = User.objects.create_user(
            email=email,
            password=None,
            is_staff=True,
            admin_role=admin_role,
        )
        user.set_unusable_password()
        user.save(update_fields=['password'])

    raw_token = secrets.token_urlsafe(32)
    StaffInvite.objects.filter(user=user, accepted_at__isnull=True).update(
        accepted_at=timezone.now(),
    )
    invite = StaffInvite.objects.create(
        email=email,
        admin_role=admin_role,
        invited_by=invited_by,
        user=user,
        token_hash=make_password(raw_token),
        expires_at=timezone.now() + _invite_ttl(),
    )
    invite_url = _frontend_invite_url(invite.id, raw_token)
    send_email_task.delay(
        'staff_invite',
        email,
        {
            'invite_url': invite_url,
            'admin_role_label': AdminRole(admin_role).label,
            'expiry_hours': int(_invite_ttl().total_seconds() // 3600),
        },
    )
    logger.info('staff_invite_sent user_id=%s invite_id=%s role=%s', user.id, invite.id, admin_role)
    monitor_event(
        'staff_invite_sent',
        invited_email=email,
        role=AdminRole(admin_role).label,
    )
    return invite, user


def accept_staff_invite(invite_id, token, password):
    token = (token or '').strip()
    if not invite_id or not token:
        raise StaffInviteError('This invite link is invalid or has expired.', 'INVALID_TOKEN')

    try:
        invite = StaffInvite.objects.select_related('user').get(
            id=invite_id,
            accepted_at__isnull=True,
            expires_at__gt=timezone.now(),
        )
    except StaffInvite.DoesNotExist:
        raise StaffInviteError('This invite link is invalid or has expired.', 'INVALID_TOKEN')

    if not check_password(token, invite.token_hash):
        raise StaffInviteError('This invite link is invalid or has expired.', 'INVALID_TOKEN')

    user = invite.user
    user.set_password(password)
    user.is_active = True
    user.is_staff = True
    user.admin_role = invite.admin_role
    user.save(update_fields=['password', 'is_active', 'is_staff', 'admin_role', 'updated_at'])

    invite.accepted_at = timezone.now()
    invite.save(update_fields=['accepted_at', 'updated_at'])
    logger.info('staff_invite_accepted user_id=%s invite_id=%s', user.id, invite.id)
    monitor_event(
        'staff_invite_accepted',
        email=user.email,
        user_id=str(user.id),
        role=AdminRole(user.admin_role).label if user.admin_role else '',
    )
    return user
