"""
Push major user engagement events to Telegram for operational monitoring.

Every message includes APP_NAME and APP_ENV from Django settings.
"""

import logging
import urllib.error
import urllib.parse
import urllib.request

from django.conf import settings

logger = logging.getLogger('ummah_tech_fest')

EVENT_LABELS = {
    'user_registered': 'New account created',
    'user_logged_in': 'User signed in',
    'open_pass_registered': 'Pass registration (paid flow)',
    'special_access_registered': 'Special access application',
    'volunteer_application_submitted': 'Volunteer application submitted',
    'volunteer_application_withdrawn': 'Volunteer application withdrawn',
    'sponsor_inquiry_created': 'Partner / sponsor inquiry',
    'speaker_application_created': 'Speaker application',
    'ticket_waitlist_joined': 'Ticket waitlist signup',
    'password_reset_requested': 'Password reset requested',
    'staff_invite_sent': 'Staff invite sent',
    'staff_invite_accepted': 'Staff invite accepted',
}

FIELD_LABELS = {
    'email': 'Email',
    'user_id': 'User ID',
    'pass_slug': 'Pass',
    'pathway': 'Pathway',
    'company': 'Company',
    'name': 'Name',
    'session': 'Session',
    'role': 'Role',
    'invited_email': 'Invited email',
}


def monitor_event(event: str, **fields) -> None:
    """Queue a Telegram notification (no-op when disabled or misconfigured)."""
    if not getattr(settings, 'TELEGRAM_MONITOR_ENABLED', False):
        return
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        logger.warning('telegram_monitor_skipped event=%s reason=missing_config', event)
        return
    if event == 'user_logged_in' and not getattr(settings, 'TELEGRAM_NOTIFY_LOGIN', False):
        return

    clean = {k: str(v) for k, v in fields.items() if v is not None and v != ''}
    from common.tasks import send_telegram_monitor_task

    send_telegram_monitor_task.delay(event, clean)


def format_monitor_message(event: str, fields: dict) -> str:
    app_name = getattr(settings, 'APP_NAME', 'Ummah Tech Fest')
    app_env = getattr(settings, 'APP_ENV', 'development')
    event_label = EVENT_LABELS.get(event, event.replace('_', ' ').title())

    lines = [
        f'📊 {app_name}',
        f'Environment: {app_env}',
        f'Event: {event_label}',
    ]
    for key, value in fields.items():
        label = FIELD_LABELS.get(key, key.replace('_', ' ').title())
        lines.append(f'{label}: {value}')
    return '\n'.join(lines)


def send_telegram_message(text: str) -> bool:
    """Send synchronously (called from Celery worker)."""
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    body = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text[:4096],
        'disable_web_page_preview': 'true',
    }).encode()
    req = urllib.request.Request(url, data=body, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return 200 <= resp.status < 300
    except urllib.error.URLError:
        logger.exception('telegram_send_failed')
        return False
