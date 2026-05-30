"""Build public URLs for uploaded media (R2 CDN or local /media/)."""

from django.conf import settings


def public_media_url(file_field, request=None):
    """Return the URL clients should use to load an uploaded file."""
    if not file_field:
        return ''
    url = file_field.url
    if url.startswith('http://') or url.startswith('https://'):
        return url
    if request:
        return request.build_absolute_uri(url)
    site = getattr(settings, 'SITE_URL', '').rstrip('/')
    if site:
        return f'{site}{url}'
    return url
