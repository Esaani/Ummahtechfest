import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import ParticipantInvite, ParticipantInviteType
from apps.volunteers.models import VolunteerApplication
from apps.outreach.models import SpeakerApplication
from common.tasks import send_email_task
from common.telegram_monitor import monitor_event

logger = logging.getLogger('ummah_tech_fest')
User = get_user_model()


class ParticipantInviteError(Exception):
    def __init__(self, message, code='PARTICIPANT_INVITE_ERROR'):
        self.message = message
        self.code = code
        super().__init__(message)


def _invite_ttl():
    hours = getattr(settings, 'PARTICIPANT_INVITE_EXPIRY_HOURS', 168)
    return timedelta(hours=hours)


def _frontend_invite_url(invite_id, token):
    base = getattr(settings, 'FRONTEND_URL', settings.SITE_URL).rstrip('/')
    return f'{base}/accept-participant-invite?id={invite_id}&token={token}'


def _next_path_for_type(invite_type):
    if invite_type == ParticipantInviteType.SPEAKER:
        return '/speaker/onboarding'
    return '/volunteer/apply'


def _email_template_for_type(invite_type):
    if invite_type == ParticipantInviteType.SPEAKER:
        return 'participant_invite_speaker'
    return 'participant_invite_volunteer'


@transaction.atomic
def create_participant_invite(email, invite_type, invited_by):
    email = email.lower().strip()
    if invite_type not in ParticipantInviteType.values:
        raise ParticipantInviteError('Invalid invite type.', 'INVALID_TYPE')

    existing = User.objects.filter(email__iexact=email).first()
    if existing:
        if existing.is_superuser or existing.is_staff:
            raise ParticipantInviteError('This email belongs to a staff account.', 'EMAIL_IN_USE')
        if invite_type == ParticipantInviteType.VOLUNTEER and VolunteerApplication.objects.filter(
            user=existing,
        ).exists():
            raise ParticipantInviteError('This user already has a volunteer application.', 'ALREADY_APPLIED')
        if invite_type == ParticipantInviteType.SPEAKER and SpeakerApplication.objects.filter(
            user=existing,
        ).exclude(status='draft').exists():
            raise ParticipantInviteError('This user already has a speaker application.', 'ALREADY_APPLIED')
        user = existing
        if not user.has_usable_password():
            user.set_unusable_password()
            user.save(update_fields=['password', 'updated_at'])
    else:
        user = User.objects.create_user(email=email, password=None, is_active=True)
        user.set_unusable_password()
        user.save(update_fields=['password'])

    ParticipantInvite.objects.filter(
        user=user,
        invite_type=invite_type,
        accepted_at__isnull=True,
    ).update(accepted_at=timezone.now())

    raw_token = secrets.token_urlsafe(32)
    invite = ParticipantInvite.objects.create(
        email=email,
        invite_type=invite_type,
        invited_by=invited_by,
        user=user,
        token_hash=make_password(raw_token),
        expires_at=timezone.now() + _invite_ttl(),
    )
    invite_url = _frontend_invite_url(invite.id, raw_token)
    role_label = ParticipantInviteType(invite_type).label
    send_email_task.delay(
        _email_template_for_type(invite_type),
        email,
        {
            'invite_url': invite_url,
            'role_label': role_label,
            'expiry_hours': int(_invite_ttl().total_seconds() // 3600),
        },
    )
    logger.info(
        'participant_invite_sent user_id=%s invite_id=%s type=%s',
        user.id,
        invite.id,
        invite_type,
    )
    monitor_event(
        'participant_invite_sent',
        invited_email=email,
        invite_type=role_label,
    )
    return invite, user


def accept_participant_invite(invite_id, token, password):
    token = (token or '').strip()
    if not invite_id or not token:
        raise ParticipantInviteError('This invite link is invalid or has expired.', 'INVALID_TOKEN')

    try:
        invite = ParticipantInvite.objects.select_related('user').get(
            id=invite_id,
            accepted_at__isnull=True,
            expires_at__gt=timezone.now(),
        )
    except ParticipantInvite.DoesNotExist:
        raise ParticipantInviteError('This invite link is invalid or has expired.', 'INVALID_TOKEN')

    if not check_password(token, invite.token_hash):
        raise ParticipantInviteError('This invite link is invalid or has expired.', 'INVALID_TOKEN')

    user = invite.user
    user.set_password(password)
    user.is_active = True
    user.save(update_fields=['password', 'is_active', 'updated_at'])

    invite.accepted_at = timezone.now()
    invite.save(update_fields=['accepted_at', 'updated_at'])

    logger.info(
        'participant_invite_accepted user_id=%s invite_id=%s type=%s',
        user.id,
        invite.id,
        invite.invite_type,
    )
    monitor_event(
        'participant_invite_accepted',
        email=user.email,
        user_id=str(user.id),
        invite_type=ParticipantInviteType(invite.invite_type).label,
    )
    return user, invite
