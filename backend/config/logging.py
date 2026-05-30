import os

LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')


class RequestContextFilter:
    def filter(self, record):
        if not hasattr(record, 'request_id'):
            record.request_id = '-'
        if not hasattr(record, 'user_id'):
            record.user_id = '-'
        return True


class SensitiveDataFilter:
    SENSITIVE = ('password', 'token', 'authorization', 'refresh', 'secret')

    def filter(self, record):
        if record.msg:
            msg = str(record.msg).lower()
            for term in self.SENSITIVE:
                if term in msg:
                    record.msg = '[REDACTED]'
                    break
        return True


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'request_context': {'()': 'config.logging.RequestContextFilter'},
        'sensitive_data': {'()': 'config.logging.SensitiveDataFilter'},
    },
    'formatters': {
        'structured': {
            'format': '%(levelname)s %(asctime)s request_id=%(request_id)s user_id=%(user_id)s %(name)s %(message)s',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'structured',
            'filters': ['request_context', 'sensitive_data'],
        },
    },
    'root': {'handlers': ['console'], 'level': LOG_LEVEL},
    'loggers': {
        'django.request': {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
        'ummah_tech_fest': {'handlers': ['console'], 'level': LOG_LEVEL, 'propagate': False},
        'security': {'handlers': ['console'], 'level': 'INFO', 'propagate': False},
    },
}
