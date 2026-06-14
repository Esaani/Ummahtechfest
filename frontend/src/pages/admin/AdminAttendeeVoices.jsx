import { useCallback, useEffect, useState } from 'react'
import { ApiError, cmsApi } from '../../api/client'
import ImageUploadField from '../../components/admin/ImageUploadField.jsx'

const emptyForm = {
  name: '',
  role: '',
  quote: '',
  image_url: '',
  image_asset: null,
  image_preview: '',
  sort_order: 0,
  is_published: true,
}

function payloadFromForm(form) {
  return {
    name: form.name,
    role: form.role,
    quote: form.quote,
    sort_order: form.sort_order,
    is_published: form.is_published,
    image_asset: form.image_asset || null,
    image_url: form.image_asset ? '' : (form.image_url || ''),
  }
}

export default function AdminAttendeeVoices() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    cmsApi
      .adminVoices()
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load attendee voices'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setForm({
      name: s.name,
      role: s.role,
      quote: s.quote,
      image_url: s.image_url || '',
      image_asset: s.image_asset || null,
      image_preview: s.image || '',
      sort_order: s.sort_order,
      is_published: s.is_published,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = payloadFromForm(form)
      if (editingId) {
        await cmsApi.updateVoice(editingId, payload)
      } else {
        await cmsApi.createVoice(payload)
      }
      resetForm()
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this attendee voice?')) return
    try {
      await cmsApi.deleteVoice(id)
      if (editingId === id) resetForm()
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Attendee voices</h1>
      <p className="body-md text-on-surface-variant mb-8 max-w-2xl">
        Manage testimonials and feedback from past attendees. Upload a headshot directly — no JSON or separate media library needed.
      </p>

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-outline-variant/30 mb-10 space-y-4">
        <h2 className="headline-sm text-primary">{editingId ? 'Edit attendee voice' : 'Add attendee voice'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Name</span>
            <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Role / Title / Organization</span>
            <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          </label>
          <ImageUploadField
            label="Attendee photo"
            folder="voices"
            previewUrl={form.image_preview}
            optionalUrl={form.image_url}
            onOptionalUrlChange={(image_url) => setForm({ ...form, image_url, image_asset: null, image_preview: image_url })}
            showUrlFallback
            onChange={({ assetId, url }) => setForm({
              ...form,
              image_asset: assetId,
              image_preview: url,
              image_url: '',
            })}
          />
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Sort order</span>
            <input type="number" className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            <span className="label-md">Published on site</span>
          </label>
          <label className="block md:col-span-2">
            <span className="label-md text-on-surface-variant mb-1 block">Quote</span>
            <span className="text-xs text-on-surface-variant/70 block mb-2">
              The testimonial or feedback text.
            </span>
            <textarea
              className="w-full min-h-[140px] px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 resize-y"
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="Incredible experience! The sessions were top-notch..."
              maxLength={2000}
              required
            />
          </label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3 rounded-lg label-md font-bold uppercase">
            {saving ? 'Saving…' : editingId ? 'Update' : 'Add voice'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-6 py-3 rounded-lg border border-outline-variant/40 label-md">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="body-md text-on-surface-variant">Loading…</p>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-outline-variant/30">
              {s.image && (
                <img src={s.image} alt="" className="w-16 h-20 object-cover rounded-lg grayscale" />
              )}
              <div className="flex-1 min-w-0">
                <p className="headline-sm text-primary">{s.name}</p>
                <p className="label-md text-primary-fixed">{s.role}</p>
                <p className="label-md text-on-surface-variant mt-1">
                  Order {s.sort_order} · {s.is_published ? 'Published' : 'Draft'}
                </p>
                <p className="body-md text-on-surface line-clamp-2 mt-2">{s.quote}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => startEdit(s)} className="px-4 py-2 rounded-lg border border-outline-variant/40 label-md">Edit</button>
                <button type="button" onClick={() => handleDelete(s.id)} className="px-4 py-2 rounded-lg border border-error/40 text-error label-md">Delete</button>
              </div>
            </div>
          ))}
          {!items.length && <p className="body-md text-on-surface-variant">No voices yet. Add your first attendee voice above.</p>}
        </div>
      )}
    </div>
  )
}
