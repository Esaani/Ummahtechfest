from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings

from common.telegram_monitor import format_monitor_message, monitor_event


@override_settings(
    APP_NAME='Ummah Tech Fest',
    APP_ENV='test',
    TELEGRAM_MONITOR_ENABLED=True,
    TELEGRAM_BOT_TOKEN='test-token',
    TELEGRAM_CHAT_ID='12345',
    TELEGRAM_NOTIFY_LOGIN=False,
)
class TelegramMonitorTest(TestCase):
    @patch('common.tasks.send_telegram_monitor_task')
    def test_monitor_event_queues_celery_task(self, mock_task):
        monitor_event('user_registered', email='a@example.com', user_id='uuid-1')
        mock_task.delay.assert_called_once_with(
            'user_registered',
            {'email': 'a@example.com', 'user_id': 'uuid-1'},
        )

    @patch('common.tasks.send_telegram_monitor_task')
    def test_login_skipped_when_disabled(self, mock_task):
        monitor_event('user_logged_in', email='a@example.com')
        mock_task.delay.assert_not_called()

    def test_format_includes_app_and_env(self):
        text = format_monitor_message('ticket_waitlist_joined', {'email': 'x@y.com', 'name': 'Ada'})
        self.assertIn('Ummah Tech Fest', text)
        self.assertIn('Environment: test', text)
        self.assertIn('Ticket waitlist signup', text)
        self.assertIn('x@y.com', text)

    @override_settings(TELEGRAM_MONITOR_ENABLED=False)
    @patch('common.tasks.send_telegram_monitor_task')
    def test_disabled_does_not_queue(self, mock_task):
        monitor_event('user_registered', email='a@example.com')
        mock_task.delay.assert_not_called()

    @patch('common.telegram_monitor.urllib.request.urlopen')
    def test_send_telegram_message(self, mock_urlopen):
        from common.telegram_monitor import send_telegram_message

        mock_urlopen.return_value.__enter__ = MagicMock(return_value=MagicMock(status=200))
        mock_urlopen.return_value.__exit__ = MagicMock(return_value=False)
        self.assertTrue(send_telegram_message('hello'))
