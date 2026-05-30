import { useEffect, useRef, useState } from 'react'
import { ApiError, cmsApi } from '../../api/client'

export default function AdminMedia() {
  const [assets, setAssets] = useState([])
  const [folder, setFolder] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const fileRef = useRef(null)

  const load = () => {
    setLoading(true)
    cmsApi
      .adminMedia(folder || undefined)
      .then((res) => setAssets(res.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load media'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [folder])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const form = new FormData()
    form.append('file', file)
    form.append('title', file.name)
    form.append('folder', folder || 'general')
    try {
      await cmsApi.uploadMedia(form)
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const copyUrl = async (asset) => {
    await navigator.clipboard.writeText(asset.url)
    setCopiedId(asset.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return
    try {
      await cmsApi.deleteMedia(id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Media library</h1>
      <p className="body-md text-on-surface-variant mb-8 max-w-2xl">
        Uploads use local storage in development and Cloudflare R2 when R2_* env vars are set on the API.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Folder filter (e.g. home)"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="flex-1 h-12 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 outline-none focus:border-primary-fixed"
        />
        <label className="btn-primary px-6 py-3 rounded-lg font-bold uppercase tracking-widest cursor-pointer text-center">
          {uploading ? 'Uploading…' : 'Upload file'}
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

      {loading ? (
        <p className="body-md text-on-surface-variant">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="glass-card rounded-xl overflow-hidden border border-outline-variant/30">
              <div className="aspect-square bg-surface-container-low flex items-center justify-center overflow-hidden">
                {asset.mime_type?.startsWith('image/') ? (
                  <img src={asset.url} alt={asset.alt_text || asset.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">movie</span>
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="label-md text-primary truncate" title={asset.title}>{asset.title}</p>
                <p className="text-[10px] text-on-surface-variant truncate">{asset.url}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(asset)}
                    className="flex-1 py-2 text-[10px] uppercase tracking-widest border border-outline-variant/40 rounded-md hover:border-primary-fixed"
                  >
                    {copiedId === asset.id ? 'Copied' : 'Copy URL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 text-error hover:bg-error/10 rounded-md"
                    aria-label="Delete"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && assets.length === 0 && (
        <p className="body-md text-on-surface-variant">No files yet. Upload an image to get started.</p>
      )}
    </div>
  )
}
