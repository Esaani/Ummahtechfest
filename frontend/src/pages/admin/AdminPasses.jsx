import { useCallback, useEffect, useState } from 'react'
import { ApiError, registrationsApi } from '../../api/client'
import AdminFormSelect from '../../components/admin/AdminFormSelect.jsx'
import {
  PASS_COLOR_OPTIONS,
  PASS_FLOW_OPTIONS,
  PASS_ICON_OPTIONS,
  PASS_TAG_BY_FLOW,
} from '../../config/adminOptions'

const emptyForm = {
  name: '',
  description: '',
  flow: 'open',
  icon: 'badge',
  tag: 'Open',
  features: 'Main Stage Plenary\nAll Thematic Tracks',
  cta_label: '',
  display_color: 'primary-fixed',
  is_outline_style: false,
  is_wired: true,
  show_on_signup: true,
  is_active: true,
  is_open_for_registration: true,
  sort_order: 0,
}

function apiToForm(p) {
  return {
    name: p.name,
    description: p.description || '',
    flow: p.flow,
    icon: p.icon || 'badge',
    tag: p.tag || '',
    features: (p.features || []).join('\n'),
    cta_label: p.cta_label || '',
    display_color: p.display_color || 'primary-fixed',
    is_outline_style: p.is_outline_style,
    is_wired: p.is_wired,
    show_on_signup: p.show_on_signup,
    is_active: p.is_active,
    is_open_for_registration: p.is_open_for_registration,
    sort_order: p.sort_order,
  }
}

function formToApi(form) {
  return {
    name: form.name,
    description: form.description,
    flow: form.flow,
    icon: form.icon,
    tag: form.tag,
    features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
    cta_label: form.cta_label,
    display_color: form.display_color,
    is_outline_style: form.is_outline_style,
    is_wired: form.is_wired,
    show_on_signup: form.show_on_signup,
    is_active: form.is_active,
    is_open_for_registration: form.is_open_for_registration,
    sort_order: form.sort_order,
  }
}

const FLOW_LABELS = {
  open: 'Open registration',
  approval: 'Approval required',
}

export default function AdminPasses() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    registrationsApi
      .adminPassTypes()
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load passes'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setForm(apiToForm(p))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = formToApi(form)
    try {
      if (editingId) {
        await registrationsApi.updatePassType(editingId, payload)
      } else {
        await registrationsApi.createPassType(payload)
      }
      resetForm()
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Event passes</h1>
      <p className="body-md text-on-surface-variant mb-8 max-w-2xl">
        Pass types shown on the signup page (Delegate, Student, Policy, etc.). Set whether each pass is open for registration or coming soon.
      </p>

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-outline-variant/30 mb-10 space-y-4">
        <h2 className="headline-sm text-primary">{editingId ? 'Edit pass' : 'Add pass'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <span className="label-md text-on-surface-variant mb-1 block">Pass name</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Delegate Pass"
              required
            />
          </label>
          <label className="block md:col-span-2">
            <span className="label-md text-on-surface-variant mb-1 block">Description</span>
            <textarea
              className="w-full min-h-[80px] p-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <AdminFormSelect
            label="Registration type"
            value={form.flow}
            onChange={(e) => {
              const flow = e.target.value
              setForm({ ...form, flow, tag: PASS_TAG_BY_FLOW[flow] || form.tag })
            }}
            options={PASS_FLOW_OPTIONS}
          />
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Badge label</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
              placeholder="Open or Approval"
              required
            />
          </label>
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Button text</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.cta_label}
              onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
              placeholder="Register as Delegate"
            />
          </label>
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Display order</span>
            <input
              type="number"
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="label-md text-on-surface-variant mb-1 block">What&apos;s included (one per line)</span>
            <textarea
              className="w-full min-h-[80px] p-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
            />
          </label>
        </div>
        <details className="rounded-lg border border-outline-variant/20 p-4">
          <summary className="label-md text-on-surface-variant cursor-pointer">Advanced display options</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <AdminFormSelect
              label="Card icon"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              options={PASS_ICON_OPTIONS}
            />
            <AdminFormSelect
              label="Accent color"
              value={form.display_color}
              onChange={(e) => setForm({ ...form, display_color: e.target.value })}
              options={PASS_COLOR_OPTIONS}
            />
          </div>
        </details>
        <div className="flex flex-wrap gap-4 label-md">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_wired} onChange={(e) => setForm({ ...form, is_wired: e.target.checked })} />
            Registration flow live on site
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.show_on_signup} onChange={(e) => setForm({ ...form, show_on_signup: e.target.checked })} />
            Show on signup page
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_open_for_registration} onChange={(e) => setForm({ ...form, is_open_for_registration: e.target.checked })} />
            Accepting new registrations
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_outline_style} onChange={(e) => setForm({ ...form, is_outline_style: e.target.checked })} />
            Outline card style
          </label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3 rounded-lg label-md font-bold uppercase">
            {saving ? 'Saving…' : editingId ? 'Update pass' : 'Add pass'}
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
          {items.map((p) => (
            <div key={p.id} className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-outline-variant/30">
              <div>
                <p className="headline-sm text-primary">{p.name}</p>
                <p className="label-md text-on-surface-variant">
                  {FLOW_LABELS[p.flow] || p.flow} · {p.is_wired ? 'Live' : 'Coming soon'}
                  {p.show_on_signup ? '' : ' · Hidden from signup'}
                </p>
              </div>
              <button type="button" onClick={() => startEdit(p)} className="px-4 py-2 rounded-lg border border-outline-variant/40 label-md shrink-0">
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
