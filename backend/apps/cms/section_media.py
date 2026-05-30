"""Resolve CMS section JSON media asset IDs to public URLs (local /media or R2)."""

from uuid import UUID

from apps.cms.models import MediaAsset


def _asset_url(asset, request):
    if not asset or not asset.file:
        return ''
    url = asset.file.url
    if request and url.startswith('/'):
        return request.build_absolute_uri(url)
    return url


def _collect_asset_ids(content):
    if not isinstance(content, dict):
        return []
    ids = []
    for key in ('video_asset_id', 'poster_asset_id'):
        raw = content.get(key)
        if raw:
            ids.append(raw)
    for card in content.get('cards') or []:
        if isinstance(card, dict) and card.get('image_asset_id'):
            ids.append(card['image_asset_id'])
    return ids


def _parse_uuid(value):
    try:
        return UUID(str(value))
    except (TypeError, ValueError):
        return None


def publish_section_content(content, request=None):
    """Return content safe for the public site with resolved video/image URLs."""
    if not isinstance(content, dict):
        return content

    asset_ids = [_parse_uuid(v) for v in _collect_asset_ids(content)]
    asset_ids = [i for i in asset_ids if i]
    assets = {
        str(a.id): a
        for a in MediaAsset.objects.filter(id__in=asset_ids).only('id', 'file')
    }

    def url_for(asset_id):
        uid = _parse_uuid(asset_id)
        if not uid:
            return ''
        return _asset_url(assets.get(str(uid)), request)

    out = dict(content)

    video_url = url_for(out.get('video_asset_id'))
    if video_url:
        out['video_url'] = video_url

    poster_url = url_for(out.get('poster_asset_id'))
    if poster_url:
        out['poster_url'] = poster_url

    cards = []
    for card in out.get('cards') or []:
        if not isinstance(card, dict):
            continue
        c = dict(card)
        image_url = url_for(c.get('image_asset_id'))
        if image_url:
            c['image_url'] = image_url
        cards.append(c)
    if cards:
        out['cards'] = cards

    return out
