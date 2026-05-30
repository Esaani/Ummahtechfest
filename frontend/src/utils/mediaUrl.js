/** Normalize CMS media URLs for use in img/video src. */
export function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return url
  return `/${url.replace(/^\/+/, '')}`
}

/** Skip bundled /assets/ paths that are not shipped in production images. */
export function cmsMediaUrl(url, fallback = '') {
  const normalized = normalizeMediaUrl(url)
  if (!normalized || normalized.startsWith('/assets/')) return fallback
  return normalized
}
