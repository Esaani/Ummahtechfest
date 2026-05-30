import { useCallback, useEffect, useState } from 'react'
import { ApiError, cmsApi } from '../../api/client'
import AdminFormSelect from '../../components/admin/AdminFormSelect.jsx'
import {
  SCHEDULE_DAY_OPTIONS,
  SCHEDULE_ITEM_TYPE_OPTIONS,
  SCHEDULE_TIME_LABEL_PRESETS,
  SCHEDULE_TIME_PRESETS,
  SCHEDULE_TRACK_OPTIONS,
} from '../../config/adminOptions'

const emptyForm = {
  item_type: 'session',
  event_day: 1,
  day_label: '01',
  day_date_label: '',
  starts_at_time: '09:00',
  time_label: '09:00 AM',
  title: '',
  subtitle: '',
  track: '',
  location: '',
  description: '',
  outcomes: '',
  speaker_name: '',
  speaker_role: '',
  speaker_image_url: '',
  speaker_quote: '',
  is_live_highlight: false,
  show_on_home: false,
  is_published: true,
  sort_order: 0,
}

function apiToForm(s) {
  return {
    item_type: s.item_type || 'session',
    event_day: s.event_day,
    day_label: s.day_label,
    day_date_label: s.day_date_label || '',
    starts_at_time: s.starts_at_time || '09:00',
    time_label: s.time_label,
    title: s.title,
    subtitle: s.subtitle || '',
    track: s.track || '',
    location: s.location || '',
    description: s.description || '',
    outcomes: (s.outcomes || []).join('\n'),
    speaker_name: s.speaker_name || '',
    speaker_role: s.speaker_role || '',
    speaker_image_url: s.speaker_image_url || '',
    speaker_quote: s.speaker_quote || '',
    is_live_highlight: s.is_live_highlight,
    show_on_home: s.show_on_home,
    is_published: s.is_published,
    sort_order: s.sort_order,
  }
}

function formToApi(form) {
  return {
    item_type: form.item_type,
    event_day: Number(form.event_day),
    day_label: form.day_label,
    day_date_label: form.day_date_label,
    starts_at_time: form.starts_at_time,
    time_label: form.time_label,
    title: form.title,
    subtitle: form.subtitle,
    track: form.track || '',
    location: form.location,
    description: form.description,
    outcomes: form.outcomes.split('\n').map((l) => l.trim()).filter(Boolean),
    speaker_name: form.speaker_name,
    speaker_role: form.speaker_role,
    speaker_image_url: form.speaker_image_url,
    speaker_quote: form.speaker_quote,
    is_live_highlight: form.is_live_highlight,
    show_on_home: form.show_on_home,
    is_published: form.is_published,
    sort_order: Number(form.sort_order),
  }
}

const TIME_LABEL_OPTIONS = [
  ...SCHEDULE_TIME_LABEL_PRESETS.map((t) => ({ value: t, label: t })),
  { value: '__custom__', label: 'Custom time label…' },
]

export default function AdminSchedule() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [customTimeLabel, setCustomTimeLabel] = useState(false)
  const [filterDay, setFilterDay] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    cmsApi
      .adminSchedule(filterDay || undefined)
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load schedule'))
      .finally(() => setLoading(false))
  }, [filterDay])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setForm(emptyForm)
    setCustomTimeLabel(false)
    setEditingId(null)
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    const f = apiToForm(s)
    setForm(f)
    setCustomTimeLabel(!SCHEDULE_TIME_LABEL_PRESETS.includes(f.time_label))
  }

  const setEventDay = (dayNum) => {
    const opt = SCHEDULE_DAY_OPTIONS.find((d) => d.value === Number(dayNum))
    setForm((prev) => ({
      ...prev,
      event_day: Number(dayNum),
      day_label: opt?.dayLabel || prev.day_label,
    }))
  }

  const setTimePreset = (startsAt) => {
    const preset = SCHEDULE_TIME_PRESETS.find((p) => p.value === startsAt)
    setForm((prev) => ({
      ...prev,
      starts_at_time: startsAt,
      time_label: preset?.display || prev.time_label,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = formToApi(form)
      if (editingId) {
        await cmsApi.updateScheduleSession(editingId, payload)
      } else {
        await cmsApi.createScheduleSession(payload)
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
    if (!window.confirm('Remove this schedule item?')) return
    try {
      await cmsApi.deleteScheduleSession(id)
      if (editingId === id) resetForm()
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  const timeLabelSelectValue = customTimeLabel ? '__custom__' : form.time_label

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Event schedule</h1>
      <p className="body-md text-on-surface-variant mb-8 max-w-2xl">
        Manage agenda items for the homepage preview and the full schedule page. Use presets for day,
        time, and track to avoid typos.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilterDay('')}
          className={`px-4 py-2 rounded-full label-md ${!filterDay ? 'bg-primary-fixed text-on-primary-fixed font-bold' : 'border border-outline-variant/40'}`}
        >
          All days
        </button>
        {SCHEDULE_DAY_OPTIONS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setFilterDay(String(d.value))}
            className={`px-4 py-2 rounded-full label-md ${filterDay === String(d.value) ? 'bg-primary-fixed text-on-primary-fixed font-bold' : 'border border-outline-variant/40'}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-outline-variant/30 mb-10 space-y-4">
        <h2 className="headline-sm text-primary">{editingId ? 'Edit item' : 'Add schedule item'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminFormSelect
            label="Item type"
            value={form.item_type}
            onChange={(e) => setForm({ ...form, item_type: e.target.value })}
            options={SCHEDULE_ITEM_TYPE_OPTIONS}
          />
          <AdminFormSelect
            label="Event day"
            value={form.event_day}
            onChange={(e) => setEventDay(e.target.value)}
            options={SCHEDULE_DAY_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
          />
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Day label (shown on cards)</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.day_label}
              onChange={(e) => setForm({ ...form, day_label: e.target.value })}
              placeholder="01"
              required
            />
          </label>
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Date line (optional)</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.day_date_label}
              onChange={(e) => setForm({ ...form, day_date_label: e.target.value })}
              placeholder="Jan 15, 2026"
            />
          </label>
          <AdminFormSelect
            label="Start time (for sorting)"
            value={form.starts_at_time}
            onChange={(e) => setTimePreset(e.target.value)}
            options={SCHEDULE_TIME_PRESETS.map((p) => ({ value: p.value, label: `${p.label} → ${p.display}` }))}
          />
          <AdminFormSelect
            label="Time shown to visitors"
            value={timeLabelSelectValue}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setCustomTimeLabel(true)
              } else {
                setCustomTimeLabel(false)
                setForm({ ...form, time_label: e.target.value })
              }
            }}
            options={TIME_LABEL_OPTIONS}
          />
          {customTimeLabel && (
            <label className="block md:col-span-2">
              <span className="label-md text-on-surface-variant mb-1 block">Custom time label</span>
              <input
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
                value={form.time_label}
                onChange={(e) => setForm({ ...form, time_label: e.target.value })}
                placeholder="09:00 AM — 10:30 AM"
                required
              />
            </label>
          )}
          <label className="block md:col-span-2">
            <span className="label-md text-on-surface-variant mb-1 block">Title</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label className="block md:col-span-2">
            <span className="label-md text-on-surface-variant mb-1 block">Short description</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </label>
          {form.item_type === 'session' && (
            <>
              <AdminFormSelect
                label="Track"
                value={form.track}
                onChange={(e) => setForm({ ...form, track: e.target.value })}
                options={SCHEDULE_TRACK_OPTIONS}
              />
              <label className="block">
                <span className="label-md text-on-surface-variant mb-1 block">Location</span>
                <input
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Main Stage (Auditorium A)"
                />
              </label>
            </>
          )}
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Display order</span>
            <input
              type="number"
              min={0}
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </label>
        </div>

        {form.item_type === 'session' && (
          <details className="rounded-lg border border-outline-variant/20 p-4">
            <summary className="label-md text-on-surface-variant cursor-pointer">Session details (schedule page & modal)</summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <label className="block md:col-span-2">
                <span className="label-md text-on-surface-variant mb-1 block">Full description</span>
                <textarea
                  className="w-full min-h-[80px] p-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="label-md text-on-surface-variant mb-1 block">Key takeaways (one per line)</span>
                <textarea
                  className="w-full min-h-[80px] p-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  value={form.outcomes}
                  onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="label-md text-on-surface-variant mb-1 block">Speaker name</span>
                <input
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  value={form.speaker_name}
                  onChange={(e) => setForm({ ...form, speaker_name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="label-md text-on-surface-variant mb-1 block">Speaker role</span>
                <input
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  value={form.speaker_role}
                  onChange={(e) => setForm({ ...form, speaker_role: e.target.value })}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="label-md text-on-surface-variant mb-1 block">Speaker photo URL</span>
                <input
                  type="url"
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  value={form.speaker_image_url}
                  onChange={(e) => setForm({ ...form, speaker_image_url: e.target.value })}
                />
              </label>
            </div>
          </details>
        )}

        <div className="flex flex-wrap gap-4 label-md">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.show_on_home} onChange={(e) => setForm({ ...form, show_on_home: e.target.checked })} />
            Show on homepage preview
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_live_highlight} onChange={(e) => setForm({ ...form, is_live_highlight: e.target.checked })} />
            Highlight as live
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Published
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3 rounded-lg label-md font-bold uppercase">
            {saving ? 'Saving…' : editingId ? 'Update' : 'Add item'}
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
            <div key={s.id} className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-outline-variant/30">
              <div>
                <p className="headline-sm text-primary">{s.title}</p>
                <p className="label-md text-on-surface-variant">
                  Day {s.event_day} · {s.time_label}
                  {s.track_label ? ` · ${s.track_label}` : ''}
                  {s.show_on_home ? ' · Homepage' : ''}
                  {!s.is_published ? ' · Draft' : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => startEdit(s)} className="px-4 py-2 rounded-lg border border-outline-variant/40 label-md">Edit</button>
                <button type="button" onClick={() => handleDelete(s.id)} className="px-4 py-2 rounded-lg border border-error/40 text-error label-md">Delete</button>
              </div>
            </div>
          ))}
          {!items.length && <p className="body-md text-on-surface-variant">No schedule items yet.</p>}
        </div>
      )}
    </div>
  )
}
