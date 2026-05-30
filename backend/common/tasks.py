import logging

from celery import shared_task

from common.email_service import send_templated_email
from common.telegram_monitor import format_monitor_message, send_telegram_message

logger = logging.getLogger('ummah_tech_fest')


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, template_key, to_email, context=None):
    try:
        send_templated_email(template_key, to_email, context or {})
    except Exception as exc:
        logger.exception('email_task_failed template=%s to=%s', template_key, to_email)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def send_telegram_monitor_task(self, event, fields=None):
    try:
        text = format_monitor_message(event, fields or {})
        if not send_telegram_message(text):
            raise RuntimeError('telegram_api_error')
        logger.info('telegram_monitor_sent event=%s', event)
    except Exception as exc:
        logger.exception('telegram_monitor_task_failed event=%s', event)
        raise self.retry(exc=exc)
