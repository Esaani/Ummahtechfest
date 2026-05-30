import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

from apps.accounts.models import PasswordReset
from common.tasks import send_email_task
from common.telegram_monitor import monitor_event

logger = logging.getLogger('ummah_tech_fest')
User = get_user_model()


class PasswordResetError(Exception):
    def __init__(self, message, code='PASSWORD_RESET_ERROR'):
        self.message = message
        self.code = code
        super().__init__(message)


def _reset_ttl():
    hours = getattr(settings, 'PASSWORD_RESET_EXPIRY_HOURS', 1)
    return timedelta(hours=hours)


def _frontend_reset_url(reset_id, token):
    base = getattr(settings, 'FRONTEND_URL', settings.SITE_URL).rstrip('/')
    return f'{base}/reset-password?id={reset_id}&token={token}'


def request_password_reset(email):
    """
    Always behave the same whether or not the email exists (no account enumeration).
    """
    email = email.lower().strip()
    user = User.objects.filter(email__iexact=email, is_active=True).first()
    if not user:
        logger.info('password_reset_skipped_no_user email=%s', email)
        return

    raw_token = secrets.token_urlsafe(32)
    PasswordReset.objects.filter(user=user, used_at__isnull=True).update(used_at=timezone.now())

    reset = PasswordReset.objects.create(
        user=user,
        token_hash=make_password(raw_token),
        expires_at=timezone.now() + _reset_ttl(),
    )

    reset_url = _frontend_reset_url(reset.id, raw_token)
    send_email_task.delay(
        'password_reset',
        user.email,
        {
            'first_name': user.first_name or user.email.split('@')[0],
            'reset_url': reset_url,
            'expiry_hours': getattr(settings, 'PASSWORD_RESET_EXPIRY_HOURS', 1),
        },
    )
    logger.info('password_reset_requested user_id=%s reset_id=%s', user.id, reset.id)
    monitor_event('password_reset_requested', email=user.email, user_id=str(user.id))


def confirm_password_reset(reset_id, token, new_password):
    token = (token or '').strip()
    if not reset_id or not token:
        raise PasswordResetError('This reset link is invalid or has expired.', 'INVALID_TOKEN')

    try:
        reset = PasswordReset.objects.select_related('user').get(
            id=reset_id,
            used_at__isnull=True,
            expires_at__gt=timezone.now(),
        )
    except PasswordReset.DoesNotExist:
        raise PasswordResetError('This reset link is invalid or has expired.', 'INVALID_TOKEN')

    if not check_password(token, reset.token_hash):
        raise PasswordResetError('This reset link is invalid or has expired.', 'INVALID_TOKEN')

    user = reset.user
    user.set_password(new_password)
    user.save(update_fields=['password'])

    reset.used_at = timezone.now()
    reset.save(update_fields=['used_at', 'updated_at'])
    PasswordReset.objects.filter(user=user, used_at__isnull=True).exclude(id=reset.id).update(
        used_at=timezone.now(),
    )
    logger.info('password_reset_completed user_id=%s', user.id)
