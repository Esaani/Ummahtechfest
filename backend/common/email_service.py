import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger('ummah_tech_fest')

EMAIL_TEMPLATES = {
    'otp_signup': {
        'subject': 'Your Ummah Tech Fest verification code',
        'template': 'emails/otp_signup.html',
    },
    'welcome': {
        'subject': 'Welcome to Ummah Tech Fest',
        'template': 'emails/welcome.html',
    },
    'sponsor_inquiry_received': {
        'subject': 'We received your sponsorship inquiry',
        'template': 'emails/sponsor_inquiry_received.html',
    },
    'speaker_application_received': {
        'subject': 'We received your speaker application',
        'template': 'emails/speaker_application_received.html',
    },
    'volunteer_application_received': {
        'subject': 'We received your volunteer application',
        'template': 'emails/volunteer_application_received.html',
    },
    'pass_registration_received': {
        'subject': 'Your pass registration was received',
        'template': 'emails/pass_registration_received.html',
    },
    'ticket_waitlist_received': {
        'subject': "You're on the Ummah Tech Fest ticket waitlist",
        'template': 'emails/ticket_waitlist_received.html',
    },
    'password_reset': {
        'subject': 'Reset your Ummah Tech Fest password',
        'template': 'emails/password_reset.html',
    },
    'staff_invite': {
        'subject': 'You are invited to the Ummah Tech Fest admin portal',
        'template': 'emails/staff_invite.html',
    },
    'participant_invite_speaker': {
        'subject': 'You are invited to speak at Ummah Tech Fest',
        'template': 'emails/participant_invite_speaker.html',
    },
    'participant_invite_volunteer': {
        'subject': 'You are invited to volunteer at Ummah Tech Fest',
        'template': 'emails/participant_invite_volunteer.html',
    },
    'submission_status_updated': {
        'subject': 'Update regarding your application',
        'template': 'emails/submission_status_updated.html',
    },
    'pass_payment_received': {
        'subject': 'Your Ummah Tech Fest pass payment is confirmed',
        'template': 'emails/pass_payment_received.html',
    },
    'donation_received': {
        'subject': 'Thank you for supporting Ummah Tech Fest',
        'template': 'emails/donation_received.html',
    },
}


def _site_context():
    return {
        'site_name': getattr(settings, 'SITE_NAME', 'Ummah Tech Fest'),
        'site_url': getattr(settings, 'SITE_URL', 'https://ummahtechfest.com'),
        'support_email': getattr(settings, 'SUPPORT_EMAIL', settings.DEFAULT_FROM_EMAIL),
    }


def send_templated_email(template_key, to_email, context=None):
    """Render and send email synchronously (used by Celery task)."""
    meta = EMAIL_TEMPLATES.get(template_key)
    if not meta:
        logger.error('unknown_email_template key=%s', template_key)
        return False

    ctx = {**_site_context(), **(context or {})}
    html_body = render_to_string(meta['template'], ctx)
    text_body = render_to_string(
        meta['template'].replace('.html', '.txt'),
        ctx,
    )

    msg = EmailMultiAlternatives(
        subject=meta['subject'],
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )
    msg.attach_alternative(html_body, 'text/html')
    try:
        msg.send(fail_silently=False)
    except Exception:
        logger.exception(
            'email_send_failed template=%s to=%s host=%s port=%s tls=%s ssl=%s',
            template_key,
            to_email,
            settings.EMAIL_HOST,
            settings.EMAIL_PORT,
            settings.EMAIL_USE_TLS,
            getattr(settings, 'EMAIL_USE_SSL', False),
        )
        raise
    logger.info('email_sent template=%s to=%s', template_key, to_email)
    return True
