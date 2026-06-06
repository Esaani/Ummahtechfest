import os
from datetime import timedelta
from pathlib import Path

import environ
from config.logging import LOGGING

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, ['localhost', '127.0.0.1']),
)

# Local dev: repo-root .env. Docker: /app/.env mounted from compose (see docker-compose.yml).
for _env_file in (BASE_DIR / '.env', BASE_DIR.parent / '.env'):
    if _env_file.is_file():
        environ.Env.read_env(_env_file)
        break

SECRET_KEY = env('DJANGO_SECRET_KEY', default='dev-only-change-in-production')
DEBUG = env.bool('DEBUG', default=True)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1', 'backend'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'common',
    'apps.accounts',
    'apps.volunteers',
    'apps.registrations',
    'apps.cms',
    'apps.outreach',
    'apps.payments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'common.middleware.RequestLoggingMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
        'NAME': env('DB_NAME', default='ummah_tech_fest'),
        'USER': env('DB_USER', default='ummah_tech_fest'),
        'PASSWORD': env('DB_PASSWORD', default=''),
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL', default='redis://127.0.0.1:6379/0'),
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
    }
}

AUTH_USER_MODEL = 'accounts.User'
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudflare R2 (S3-compatible) — all four values required to enable R2 storage.
# Aliases supported: R2_STORAGE_BUCKET_NAME, R2_S3_ENDPOINT_URL (see .env.live).
R2_ACCESS_KEY_ID = env('R2_ACCESS_KEY_ID', default='')
R2_SECRET_ACCESS_KEY = env('R2_SECRET_ACCESS_KEY', default='')
R2_BUCKET_NAME = env('R2_BUCKET_NAME', default='') or env('R2_STORAGE_BUCKET_NAME', default='')
R2_ENDPOINT_URL = env('R2_ENDPOINT_URL', default='') or env('R2_S3_ENDPOINT_URL', default='')
R2_PUBLIC_URL = env('R2_PUBLIC_URL', default='')

_USE_R2 = bool(R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_BUCKET_NAME and R2_ENDPOINT_URL)
USE_R2_STORAGE = _USE_R2

# Django's built-in /admin/ site — off by default; use the React CMS at /admin/* instead.
ENABLE_DJANGO_ADMIN = env.bool('ENABLE_DJANGO_ADMIN', default=False)
DJANGO_ADMIN_URL_PATH = env('DJANGO_ADMIN_URL_PATH', default='internal-django-admin')

if _USE_R2:
    AWS_ACCESS_KEY_ID = R2_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY = R2_SECRET_ACCESS_KEY
    AWS_STORAGE_BUCKET_NAME = R2_BUCKET_NAME
    AWS_S3_ENDPOINT_URL = R2_ENDPOINT_URL
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='') or env('R2_S3_REGION_NAME', default='auto')
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    if R2_PUBLIC_URL:
        AWS_S3_CUSTOM_DOMAIN = R2_PUBLIC_URL.replace('https://', '').replace('http://', '').rstrip('/')
        MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/'
    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }
else:
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }


import sys
SITE_NAME = env('SITE_NAME', default='Ummah Tech Fest')
APP_NAME = env('APP_NAME', default=SITE_NAME)
APP_ENV = env('APP_ENV', default='development')
SITE_URL = env('SITE_URL', default='http://localhost:8080')
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:5173')
PASSWORD_RESET_EXPIRY_HOURS = env.int('PASSWORD_RESET_EXPIRY_HOURS', default=1)
SUPPORT_EMAIL = env('SUPPORT_EMAIL', default='hello@ummahtechfest.com')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@ummahtechfest.com')

EMAIL_BACKEND = env(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend',
)
EMAIL_HOST = env('EMAIL_HOST', default='localhost')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_USE_SSL = env.bool('EMAIL_USE_SSL', default=False)
EMAIL_TIMEOUT = env.int('EMAIL_TIMEOUT', default=30)

EMAIL_OTP_EXPIRY_MINUTES = env.int('EMAIL_OTP_EXPIRY_MINUTES', default=15)
EMAIL_OTP_RESEND_COOLDOWN_SECONDS = env.int('EMAIL_OTP_RESEND_COOLDOWN_SECONDS', default=60)
EMAIL_OTP_MAX_RESENDS = env.int('EMAIL_OTP_MAX_RESENDS', default=5)
EMAIL_OTP_MAX_ATTEMPTS = env.int('EMAIL_OTP_MAX_ATTEMPTS', default=5)

CELERY_BROKER_URL = env('CELERY_BROKER_URL', default=env('REDIS_URL', default='redis://127.0.0.1:6379/0'))
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default=CELERY_BROKER_URL)
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TASK_TRACK_STARTED = True

# Telegram monitoring (major user / engagement events)
TELEGRAM_MONITOR_ENABLED = env.bool('TELEGRAM_MONITOR_ENABLED', default=False)
TELEGRAM_BOT_TOKEN = env('TELEGRAM_BOT_TOKEN', default='')
TELEGRAM_CHAT_ID = env('TELEGRAM_CHAT_ID', default='')
TELEGRAM_NOTIFY_LOGIN = env.bool('TELEGRAM_NOTIFY_LOGIN', default=False)

# Payments (Paystack first; provider layer supports additional backends)
DEFAULT_PAYMENT_PROVIDER = env('DEFAULT_PAYMENT_PROVIDER', default='paystack')
PAYSTACK_SECRET_KEY = env('PAYSTACK_SECRET_KEY', default='')
PAYSTACK_PUBLIC_KEY = env('PAYSTACK_PUBLIC_KEY', default='')
PAYSTACK_WEBHOOK_SECRET = env('PAYSTACK_WEBHOOK_SECRET', default='') or PAYSTACK_SECRET_KEY
PASS_DEFAULT_PRICE_GHS = env('PASS_DEFAULT_PRICE_GHS', default='500')
PASS_DEFAULT_PRICES_GHS = {
    'delegate': env('PASS_PRICE_DELEGATE_GHS', default='750'),
    'startup': env('PASS_PRICE_STARTUP_GHS', default='400'),
    'student': env('PASS_PRICE_STUDENT_GHS', default='150'),
}

if 'test' in sys.argv:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
    CACHES['default'] = {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}
    PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
    EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['http://localhost:5173', 'http://localhost'])
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '120/minute',
        'auth': '15/minute',
        'otp_send': '5/hour',
        'otp_confirm': '30/hour',
        'otp_resend': '10/hour',
        'public_form': '20/hour',
        'password_reset': '10/hour',
        'authenticated_form': '30/hour',
    },
    'EXCEPTION_HANDLER': 'common.exceptions.custom_exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Ummah Tech Fest API',
    'VERSION': '1.0.0',
}

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
if not DEBUG:
    SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
