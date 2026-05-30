import logging
import mimetypes

from django.conf import settings
from django.core.files.storage import default_storage
from django.http import FileResponse, Http404, HttpResponseRedirect
from django.views import View

logger = logging.getLogger('ummah_tech_fest')


class PublicMediaView(View):
    """Serve CMS uploads from R2 (redirect) or local disk (stream)."""

    def get(self, request, path):
        safe_path = path.lstrip('/')
        if '..' in safe_path or not safe_path.startswith('cms/'):
            raise Http404()

        if not default_storage.exists(safe_path):
            logger.warning(
                'media_file_missing path=%s use_r2=%s media_root=%s',
                safe_path,
                settings.USE_R2_STORAGE,
                settings.MEDIA_ROOT,
            )
            raise Http404()

        url = default_storage.url(safe_path)
        if url.startswith('http://') or url.startswith('https://'):
            return HttpResponseRedirect(url)

        try:
            stored = default_storage.open(safe_path, 'rb')
        except OSError:
            logger.exception('media_open_failed path=%s', safe_path)
            raise Http404() from None

        content_type, _ = mimetypes.guess_type(safe_path)
        return FileResponse(stored, content_type=content_type or 'application/octet-stream')
