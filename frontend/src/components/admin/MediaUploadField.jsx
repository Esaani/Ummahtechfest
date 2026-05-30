import { useRef, useState } from 'react'
import { ApiError, cmsApi } from '../../api/client'

/**
 * Upload image or video to CMS storage (local media or R2 when configured).
 */
export default function MediaUploadField({
  label,
  folder = 'general',
  previewUrl = '',
  previewType = 'image',
  accept = 'image/*',
  hint = 'JPEG, PNG, or WebP · max 50MB',
  onChange,
  optionalUrl = '',
  onOptionalUrlChange,
  showUrlFallback = false,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      formData.append('title', file.name)
      const res = await cmsApi.uploadMedia(formData)
      onChange({ assetId: res.data.id, url: res.data.url, mimeType: res.data.mime_type })
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clearMedia = () => {
    onChange({ assetId: null, url: '', mimeType: '' })
    if (onOptionalUrlChange) onOptionalUrlChange('')
  }

  const displayUrl = previewUrl || optionalUrl
  const isVideo = previewType === 'video' || (displayUrl && /\.(mp4|webm|mov)(\?|$)/i.test(displayUrl))

  return (
    <div className="md:col-span-2 space-y-3">
      <span className="label-md text-on-surface-variant block">{label}</span>
      {displayUrl && (
        <div className="flex items-start gap-4">
          {isVideo ? (
            <video src={displayUrl} className="w-40 max-h-28 rounded-lg border border-outline-variant/30" muted controls />
          ) : (
            <img src={displayUrl} alt="" className="w-24 h-24 object-cover rounded-lg border border-outline-variant/30" />
          )}
          <button type="button" onClick={clearMedia} className="label-md text-error hover:underline">
            Remove
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 rounded-lg border-2 border-primary-fixed text-primary-fixed label-md font-bold uppercase tracking-wider hover:bg-primary-fixed/10 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : displayUrl ? 'Replace file' : 'Upload file'}
        </button>
        <span className="body-sm text-on-surface-variant">{hint}</span>
      </div>
      {uploadError && <p className="body-sm text-error">{uploadError}</p>}
      {showUrlFallback && onOptionalUrlChange && (
        <label className="block">
          <span className="label-md text-on-surface-variant mb-1 block">Or paste URL (optional)</span>
          <input
            className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
            value={optionalUrl}
            onChange={(e) => onOptionalUrlChange(e.target.value)}
            placeholder="https://…"
          />
        </label>
      )}
    </div>
  )
}
