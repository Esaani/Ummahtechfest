"""Build public URLs for uploaded media (R2 CDN or local /media/)."""

from django.conf import settings


def public_media_url(file_field, request=None):
    """Return the URL clients should use to load an uploaded file."""
    if not file_field:
        return ''
    url = file_field.url
    # R2/S3 storage already returns an absolute https:// URL — pass it straight through.
    if url.startswith('http://') or url.startswith('https://'):
        return url
    # Local file storage returns a relative /media/... path.
    # Do NOT use request.build_absolute_uri(): in Docker Compose the request Host is
    # the internal service name (e.g. backend:8000), which browsers cannot resolve.
    # Use SITE_URL when explicitly set (e.g. production without R2, or email templates).
    # Otherwise return the relative path — the frontend proxy forwards /media/ to Django.
    site = getattr(settings, 'SITE_URL', '').rstrip('/')
    if site:
        return f'{site}{url}'
    return url
