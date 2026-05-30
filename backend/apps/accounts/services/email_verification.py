import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.core import signing
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import EmailVerification, EmailVerificationPurpose, User

logger = logging.getLogger('ummah_tech_fest')

SIGNUP_TOKEN_SALT = 'signup-email-verified'
SIGNUP_TOKEN_MAX_AGE = 3600  # 1 hour after OTP verify


class EmailVerificationError(Exception):
    def __init__(self, message, code='VERIFICATION_ERROR'):
        self.message = message
        self.code = code
        super().__init__(message)


def _generate_otp():
    return f'{secrets.randbelow(1_000_000):06d}'


def _otp_ttl():
    return timedelta(minutes=getattr(settings, 'EMAIL_OTP_EXPIRY_MINUTES', 15))


def _resend_cooldown():
    return timedelta(seconds=getattr(settings, 'EMAIL_OTP_RESEND_COOLDOWN_SECONDS', 60))


def _max_resends():
    return getattr(settings, 'EMAIL_OTP_MAX_RESENDS', 5)


def _max_attempts():
    return getattr(settings, 'EMAIL_OTP_MAX_ATTEMPTS', 5)


def assert_email_available_for_signup(email):
    email = email.lower().strip()
    if User.objects.filter(email__iexact=email).exists():
        raise EmailVerificationError(
            'An account with this email already exists. Try signing in instead.',
            code='EMAIL_ALREADY_REGISTERED',
        )
    return email


def send_signup_otp(email):
    email = assert_email_available_for_signup(email)
    now = timezone.now()

    recent = (
        EmailVerification.objects.filter(
            email__iexact=email,
            purpose=EmailVerificationPurpose.SIGNUP,
            verified_at__isnull=True,
            expires_at__gt=now,
        )
        .order_by('-created_at')
        .first()
    )

    if recent and recent.last_sent_at and now - recent.last_sent_at < _resend_cooldown():
        wait = int((_resend_cooldown() - (now - recent.last_sent_at)).total_seconds())
        raise EmailVerificationError(
            f'Please wait {wait} seconds before requesting another code.',
            code='OTP_RESEND_COOLDOWN',
        )

    if recent and recent.resend_count >= _max_resends():
        raise EmailVerificationError(
            'Too many code requests. Please try again later.',
            code='OTP_RESEND_LIMIT',
        )

    otp = _generate_otp()
    expires_at = now + _otp_ttl()

    if recent and not recent.is_expired:
        recent.otp_hash = make_password(otp)
        recent.expires_at = expires_at
        recent.resend_count += 1
        recent.last_sent_at = now
        recent.attempt_count = 0
        recent.save(update_fields=['otp_hash', 'expires_at', 'resend_count', 'last_sent_at', 'attempt_count', 'updated_at'])
        verification = recent
    else:
        verification = EmailVerification.objects.create(
            email=email,
            purpose=EmailVerificationPurpose.SIGNUP,
            otp_hash=make_password(otp),
            expires_at=expires_at,
            last_sent_at=now,
        )

    from common.tasks import send_email_task

    send_email_task.delay(
        'otp_signup',
        email,
        {
            'otp_code': otp,
            'expiry_minutes': int(_otp_ttl().total_seconds() // 60),
        },
    )
    logger.info('signup_otp_sent verification_id=%s', verification.id)
    return verification


def confirm_signup_otp(verification_id, code):
    try:
        verification = EmailVerification.objects.get(
            id=verification_id,
            purpose=EmailVerificationPurpose.SIGNUP,
            verified_at__isnull=True,
        )
    except EmailVerification.DoesNotExist:
        raise EmailVerificationError('Invalid or expired verification.', code='VERIFICATION_NOT_FOUND')

    if verification.is_expired:
        raise EmailVerificationError('This code has expired. Request a new one.', code='OTP_EXPIRED')

    if verification.attempt_count >= _max_attempts():
        raise EmailVerificationError('Too many failed attempts. Request a new code.', code='OTP_ATTEMPTS_EXCEEDED')

    verification.attempt_count += 1
    verification.save(update_fields=['attempt_count', 'updated_at'])

    if not check_password(code.strip(), verification.otp_hash):
        raise EmailVerificationError('Invalid verification code.', code='OTP_INVALID')

    assert_email_available_for_signup(verification.email)

    verification.verified_at = timezone.now()
    verification.save(update_fields=['verified_at', 'updated_at'])

    signup_token = signing.TimestampSigner(salt=SIGNUP_TOKEN_SALT).sign(str(verification.id))
    logger.info('signup_otp_verified verification_id=%s', verification.id)
    return verification, signup_token


def resend_signup_otp(verification_id):
    try:
        verification = EmailVerification.objects.get(
            id=verification_id,
            purpose=EmailVerificationPurpose.SIGNUP,
            verified_at__isnull=True,
        )
    except EmailVerification.DoesNotExist:
        raise EmailVerificationError('Invalid or expired verification.', code='VERIFICATION_NOT_FOUND')

    return send_signup_otp(verification.email)


def validate_signup_token(signup_token):
    signer = signing.TimestampSigner(salt=SIGNUP_TOKEN_SALT)
    try:
        verification_id = signer.unsign(signup_token, max_age=SIGNUP_TOKEN_MAX_AGE)
    except signing.BadSignature:
        raise serializers.ValidationError({'signup_token': ['Email verification expired. Please verify your email again.']})

    try:
        verification = EmailVerification.objects.get(
            id=verification_id,
            purpose=EmailVerificationPurpose.SIGNUP,
        )
    except EmailVerification.DoesNotExist:
        raise serializers.ValidationError({'signup_token': ['Invalid verification. Please start again.']})

    if not verification.is_verified:
        raise serializers.ValidationError({'signup_token': ['Email not verified. Please complete verification first.']})

    if verification.is_expired and verification.verified_at is None:
        raise serializers.ValidationError({'signup_token': ['Verification expired. Please verify your email again.']})

    email = verification.email.lower()
    if User.objects.filter(email__iexact=email).exists():
        raise serializers.ValidationError({'email': ['An account with this email already exists.']})

    return email, verification
