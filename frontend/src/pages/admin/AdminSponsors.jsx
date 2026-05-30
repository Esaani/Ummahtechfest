import { useCallback, useEffect, useState } from 'react'
import { ApiError, cmsApi } from '../../api/client'
import ImageUploadField from '../../components/admin/ImageUploadField.jsx'
import MediaUploadField from '../../components/admin/MediaUploadField.jsx'
import SponsorshipBenefitField from '../../components/admin/SponsorshipBenefitField.jsx'
import { slugifyTierName } from '../../config/sponsorshipBenefitFields'

const MAIN_TABS = [
  { id: 'packages', label: 'Sponsorship tiers' },
  { id: 'benefits', label: 'Table benefits' },
  { id: 'page', label: 'Sponsor page' },
  { id: 'logos', label: 'Homepage logos' },
]

const LOGO_TIERS = [
  { id: 'global_partner', label: 'Global partners' },
  { id: 'sponsor', label: 'Sponsors' },
]

const emptyPackageForm = (benefitRows = []) => ({
  name: '',
  tagline: '',
  price_display: '',
  benefit_values: Object.fromEntries(benefitRows.map((r) => [r.key, ''])),
  show_on_inquiry_form: true,
  show_in_comparison_table: true,
  highlight_column: false,
  sort_order: 0,
  is_published: true,
})

const emptyBenefitForm = {
  label: '',
  sort_order: 0,
}

const emptyLogoForm = (tier) => ({
  name: '',
  tier,
  website: '',
  logo_url: '',
  logo_asset: null,
  logo_preview: '',
  sort_order: 0,
  is_published: true,
})

function payloadFromLogoForm(form) {
  return {
    name: form.name,
    tier: form.tier,
    website: form.website,
    sort_order: form.sort_order,
    is_published: form.is_published,
    logo_asset: form.logo_asset || null,
    logo_url: form.logo_asset ? '' : (form.logo_url || ''),
  }
}

function packageToForm(p, benefitRows) {
  const benefit_values = Object.fromEntries(
    benefitRows.map((r) => [r.key, p.benefit_values?.[r.key] || '']),
  )
  return {
    name: p.name,
    tagline: p.tagline || '',
    price_display: p.price_display || '',
    benefit_values,
    show_on_inquiry_form: p.show_on_inquiry_form,
    show_in_comparison_table: p.show_in_comparison_table,
    highlight_column: p.highlight_column,
    sort_order: p.sort_order,
    is_published: p.is_published,
  }
}

function formToPackagePayload(form, existingSlug) {
  const benefit_values = {}
  Object.entries(form.benefit_values || {}).forEach(([key, val]) => {
    const trimmed = (val || '').trim()
    if (trimmed) benefit_values[key] = trimmed
  })
  return {
    slug: existingSlug || slugifyTierName(form.name),
    name: form.name.trim(),
    tagline: form.tagline.trim(),
    price_display: form.price_display.trim(),
    benefit_values,
    show_on_inquiry_form: form.show_on_inquiry_form,
    show_in_comparison_table: form.show_in_comparison_table,
    highlight_column: form.highlight_column,
    sort_order: Number(form.sort_order),
    is_published: form.is_published,
  }
}

function SponsorshipPackagesPanel({ onError }) {
  const [items, setItems] = useState([])
  const [benefitRows, setBenefitRows] = useState([])
  const [form, setForm] = useState(emptyPackageForm())
  const [editingId, setEditingId] = useState(null)
  const [editingSlug, setEditingSlug] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadBenefitRows = useCallback(() => {
    return cmsApi.adminSponsorshipBenefitRows().then((res) => {
      const rows = res.data || []
      setBenefitRows(rows)
      return rows
    })
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([cmsApi.adminSponsorshipPackages(), loadBenefitRows()])
      .then(([packagesRes]) => setItems(packagesRes.data || []))
      .catch((err) => onError(err instanceof ApiError ? err.message : 'Failed to load packages'))
      .finally(() => setLoading(false))
  }, [loadBenefitRows, onError])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!editingId && benefitRows.length) {
      setForm((prev) => ({
        ...prev,
        benefit_values: Object.fromEntries(
          benefitRows.map((r) => [r.key, prev.benefit_values?.[r.key] || '']),
        ),
      }))
    }
  }, [benefitRows, editingId])

  const resetForm = () => {
    setForm(emptyPackageForm(benefitRows))
    setEditingId(null)
    setEditingSlug('')
  }

  const setBenefitValue = (key, val) => {
    setForm((prev) => ({
      ...prev,
      benefit_values: { ...prev.benefit_values, [key]: val },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      onError('Please enter a tier name (e.g. Gold Sponsor).')
      return
    }
    setSaving(true)
    onError('')
    try {
      const payload = formToPackagePayload(form, editingSlug || undefined)
      if (editingId) {
        await cmsApi.updateSponsorshipPackage(editingId, payload)
      } else {
        await cmsApi.createSponsorshipPackage(payload)
      }
      resetForm()
      load()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this sponsorship tier?')) return
    try {
      await cmsApi.deleteSponsorshipPackage(id)
      if (editingId === id) resetForm()
      load()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditingSlug(p.slug)
    setForm(packageToForm(p, benefitRows))
  }

  return (
    <div>
      <p className="body-md text-on-surface-variant mb-6 max-w-3xl">
        Add or edit sponsorship tiers shown on the public sponsor page — the inquiry form and the comparison table.
        Pick options from each dropdown; no technical setup required.
      </p>

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-outline-variant/30 mb-10 space-y-6">
        <h2 className="headline-sm text-primary">{editingId ? 'Edit tier' : 'Add tier'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <span className="label-md text-on-surface-variant mb-1 block">Tier name</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Gold Sponsor"
            />
            <span className="text-xs text-on-surface-variant mt-1 block">
              Shown on the sponsor page and inquiry form.
            </span>
          </label>
          <label className="block md:col-span-2">
            <span className="label-md text-on-surface-variant mb-1 block">Short description</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="e.g. Strong presence · keynote & premium booth"
            />
            <span className="text-xs text-on-surface-variant mt-1 block">
              One line under the tier name on the inquiry form.
            </span>
          </label>
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Price (optional)</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.price_display}
              onChange={(e) => setForm({ ...form, price_display: e.target.value })}
              placeholder="₵15,000"
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
            <span className="text-xs text-on-surface-variant mt-1 block">Lower numbers appear first.</span>
          </label>
        </div>

        {benefitRows.length > 0 ? (
          <div className="border-t border-outline-variant/20 pt-6">
            <h3 className="label-md text-primary font-bold uppercase tracking-wider mb-1">What&apos;s included</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              These appear in the comparison table on the sponsor page. Choose an option for each row.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefitRows.map((row) => (
                <SponsorshipBenefitField
                  key={row.id}
                  rowKey={row.key}
                  rowLabel={row.label}
                  value={form.benefit_values?.[row.key] || ''}
                  onChange={(val) => setBenefitValue(row.key, val)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low/50 p-4">
            <p className="body-md text-on-surface-variant">
              Add table benefits first (Table benefits tab) so you can pick what each tier includes.
            </p>
          </div>
        )}

        <div className="border-t border-outline-variant/20 pt-6 space-y-3">
          <p className="label-md text-primary font-bold uppercase tracking-wider">Visibility</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.show_on_inquiry_form}
              onChange={(e) => setForm({ ...form, show_on_inquiry_form: e.target.checked })}
            />
            <span>
              <span className="label-md block">Show on inquiry form</span>
              <span className="text-xs text-on-surface-variant">Visitors can select this tier when submitting a sponsor inquiry.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.show_in_comparison_table}
              onChange={(e) => setForm({ ...form, show_in_comparison_table: e.target.checked })}
            />
            <span>
              <span className="label-md block">Show in comparison table</span>
              <span className="text-xs text-on-surface-variant">Display as a column on the tier comparison table.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.highlight_column}
              onChange={(e) => setForm({ ...form, highlight_column: e.target.checked })}
            />
            <span>
              <span className="label-md block">Highlight this tier</span>
              <span className="text-xs text-on-surface-variant">Recommended option — shown with accent styling on the table.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            <span>
              <span className="label-md block">Published</span>
              <span className="text-xs text-on-surface-variant">Uncheck to hide while you&apos;re still drafting.</span>
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3 rounded-lg label-md font-bold uppercase">
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add tier'}
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
            <div key={p.id} className="glass-card flex items-center justify-between gap-4 p-5 rounded-xl border border-outline-variant/30">
              <div>
                <p className="headline-sm text-primary">{p.name}</p>
                <p className="label-md text-on-surface-variant">
                  {p.price_display || 'No price listed'} · Order {p.sort_order}
                  {p.is_published ? ' · Live' : ' · Draft'}
                  {p.highlight_column ? ' · Highlighted' : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => startEdit(p)} className="px-4 py-2 rounded-lg border border-outline-variant/40 label-md">Edit</button>
                <button type="button" onClick={() => handleDelete(p.id)} className="px-4 py-2 rounded-lg border border-error/40 text-error label-md">Delete</button>
              </div>
            </div>
          ))}
          {!items.length && (
            <p className="body-md text-on-surface-variant">
              No tiers yet. Add your first sponsorship tier using the form above.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function BenefitRowsPanel({ onError }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyBenefitForm)
  const [editingKey, setEditingKey] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    cmsApi
      .adminSponsorshipBenefitRows()
      .then((res) => setItems(res.data || []))
      .catch((err) => onError(err instanceof ApiError ? err.message : 'Failed to load rows'))
      .finally(() => setLoading(false))
  }, [onError])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setForm(emptyBenefitForm)
    setEditingId(null)
    setEditingKey('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    onError('')
    try {
      const payload = {
        label: form.label.trim(),
        sort_order: form.sort_order,
        key: editingKey || slugifyTierName(form.label),
      }
      if (editingId) {
        await cmsApi.updateSponsorshipBenefitRow(editingId, payload)
      } else {
        await cmsApi.createSponsorshipBenefitRow(payload)
      }
      resetForm()
      load()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this comparison row?')) return
    try {
      await cmsApi.deleteSponsorshipBenefitRow(id)
      if (editingId === id) resetForm()
      load()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <p className="body-md text-on-surface-variant mb-6 max-w-3xl">
        These are the rows in the left column of the sponsor comparison table (e.g. &quot;VIP Tickets&quot;, &quot;Speaking Slot&quot;).
        After adding a row here, you can set what each tier includes on the Sponsorship tiers tab.
      </p>

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-outline-variant/30 mb-10 space-y-4">
        <h2 className="headline-sm text-primary">{editingId ? 'Edit benefit' : 'Add benefit'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <span className="label-md text-on-surface-variant mb-1 block">Benefit name</span>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
              placeholder="e.g. VIP Tickets"
            />
            <span className="text-xs text-on-surface-variant mt-1 block">
              This is what visitors see in the comparison table.
            </span>
          </label>
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Display order</span>
            <input
              type="number"
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
            <span className="text-xs text-on-surface-variant mt-1 block">Lower numbers appear higher in the table.</span>
          </label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3 rounded-lg label-md font-bold uppercase">
            {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
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
          {items.map((r) => (
            <div key={r.id} className="glass-card flex items-center justify-between gap-4 p-5 rounded-xl border border-outline-variant/30">
              <div>
                <p className="headline-sm text-primary">{r.label}</p>
                <p className="label-md text-on-surface-variant">Order {r.sort_order}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(r.id)
                    setEditingKey(r.key)
                    setForm({ label: r.label, sort_order: r.sort_order })
                  }}
                  className="px-4 py-2 rounded-lg border border-outline-variant/40 label-md"
                >
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(r.id)} className="px-4 py-2 rounded-lg border border-error/40 text-error label-md">Delete</button>
              </div>
            </div>
          ))}
          {!items.length && <p className="body-md text-on-surface-variant">No comparison rows yet.</p>}
        </div>
      )}
    </div>
  )
}

function HomepageLogosPanel({ onError }) {
  const [tier, setTier] = useState('global_partner')
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyLogoForm('global_partner'))
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    cmsApi
      .adminSponsors(tier)
      .then((res) => setItems(res.data || []))
      .catch((err) => onError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [tier, onError])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setForm(emptyLogoForm(tier))
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    onError('')
    try {
      const payload = payloadFromLogoForm(form)
      if (editingId) {
        await cmsApi.updateSponsor(editingId, payload)
      } else {
        await cmsApi.createSponsor(payload)
      }
      resetForm()
      load()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this logo from the homepage?')) return
    try {
      await cmsApi.deleteSponsor(id)
      if (editingId === id) resetForm()
      load()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <p className="body-md text-on-surface-variant mb-6 max-w-3xl">
        Names and logos in the homepage marquee — separate from sponsorship packages on the sponsor page.
      </p>

      <div className="flex gap-2 mb-8 flex-wrap">
        {LOGO_TIERS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTier(t.id); setForm(emptyLogoForm(t.id)); setEditingId(null) }}
            className={`px-4 py-2 rounded-full label-md uppercase tracking-wider ${
              tier === t.id ? 'bg-primary-fixed text-on-primary-fixed font-bold' : 'border border-outline-variant/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-outline-variant/30 mb-10 space-y-4">
        <h2 className="headline-sm text-primary">{editingId ? 'Edit entry' : `Add ${tier === 'global_partner' ? 'global partner' : 'sponsor'}`}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Name</span>
            <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Website (optional)</span>
            <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </label>
          <ImageUploadField
            label="Logo (optional)"
            folder="sponsors"
            previewUrl={form.logo_preview}
            optionalUrl={form.logo_url}
            onOptionalUrlChange={(logo_url) => setForm({ ...form, logo_url, logo_asset: null, logo_preview: logo_url })}
            showUrlFallback
            onChange={({ assetId, url }) => setForm({
              ...form,
              logo_asset: assetId,
              logo_preview: url,
              logo_url: '',
            })}
          />
          <label className="block">
            <span className="label-md text-on-surface-variant mb-1 block">Sort order</span>
            <input type="number" className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            <span className="label-md">Published</span>
          </label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3 rounded-lg label-md font-bold uppercase">
            {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
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
            <div key={s.id} className="glass-card flex items-center justify-between gap-4 p-5 rounded-xl border border-outline-variant/30">
              <div className="flex items-center gap-4 min-w-0">
                {s.logo && <img src={s.logo} alt="" className="w-12 h-12 object-contain rounded" />}
                <div>
                  <p className="headline-sm text-primary">{s.name}</p>
                  <p className="label-md text-on-surface-variant">Order {s.sort_order} · {s.is_published ? 'Published' : 'Draft'}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(s.id)
                    setForm({
                      name: s.name,
                      tier: s.tier,
                      website: s.website || '',
                      logo_url: s.logo_url || '',
                      logo_asset: s.logo_asset || null,
                      logo_preview: s.logo || '',
                      sort_order: s.sort_order,
                      is_published: s.is_published,
                    })
                  }}
                  className="px-4 py-2 rounded-lg border border-outline-variant/40 label-md"
                >
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(s.id)} className="px-4 py-2 rounded-lg border border-error/40 text-error label-md">Delete</button>
              </div>
            </div>
          ))}
          {!items.length && <p className="body-md text-on-surface-variant">No entries in this tier yet.</p>}
        </div>
      )}
    </div>
  )
}

function SponsorPagePanel({ onError }) {
  const [section, setSection] = useState(null)
  const [form, setForm] = useState({
    hero_image_asset_id: null,
    hero_image_url: '',
    hero_preview: '',
    stat_value: '5,000+',
    stat_label: 'Targeted Tech Professionals',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    cmsApi
      .adminSections()
      .then((res) => {
        const hero = (res.data || []).find((s) => s.slug === 'sponsor-hero')
        setSection(hero || null)
        if (hero?.content) {
          setForm({
            hero_image_asset_id: hero.content.hero_image_asset_id || null,
            hero_image_url: hero.content.hero_image_url || '',
            hero_preview: hero.content.hero_image_url || '',
            stat_value: hero.content.stat_value || '5,000+',
            stat_label: hero.content.stat_label || 'Targeted Tech Professionals',
          })
        }
      })
      .catch((err) => onError(err instanceof ApiError ? err.message : 'Failed to load sponsor page'))
      .finally(() => setLoading(false))
  }, [onError])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!section) {
      onError('Sponsor page section missing. Run: python manage.py seed')
      return
    }
    setSaving(true)
    setMessage('')
    onError('')
    try {
      await cmsApi.updateSection(section.id, {
        content: {
          hero_image_asset_id: form.hero_image_asset_id,
          hero_image_url: form.hero_image_asset_id ? '' : (form.hero_image_url || '').trim(),
          stat_value: form.stat_value,
          stat_label: form.stat_label,
        },
      })
      setMessage('Sponsor page saved.')
      load()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="body-md text-on-surface-variant">Loading…</p>
  }

  return (
    <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl border border-outline-variant/30 space-y-6 max-w-2xl">
      <p className="body-md text-on-surface-variant">
        Hero image on the public <strong>/sponsor</strong> page (large image beside the headline on desktop).
      </p>
      {message && <p className="p-3 rounded-lg bg-primary-fixed/10 body-md text-primary-fixed">{message}</p>}
      <MediaUploadField
        label="Hero image"
        folder="sponsor"
        accept="image/*"
        previewUrl={form.hero_preview || form.hero_image_url}
        showUrlFallback
        optionalUrl={form.hero_image_url}
        onOptionalUrlChange={(url) => setForm({
          ...form,
          hero_image_url: url,
          hero_image_asset_id: url ? null : form.hero_image_asset_id,
          hero_preview: url || form.hero_preview,
        })}
        onChange={({ assetId, url }) => setForm({
          ...form,
          hero_image_asset_id: assetId,
          hero_preview: url,
          hero_image_url: assetId ? '' : form.hero_image_url,
        })}
      />
      <label className="block">
        <span className="label-md text-on-surface-variant mb-1 block">Stat value</span>
        <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={form.stat_value} onChange={(e) => setForm({ ...form, stat_value: e.target.value })} />
      </label>
      <label className="block">
        <span className="label-md text-on-surface-variant mb-1 block">Stat label</span>
        <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={form.stat_label} onChange={(e) => setForm({ ...form, stat_label: e.target.value })} />
      </label>
      <button type="submit" disabled={saving} className="btn-primary px-8 py-3 rounded-lg label-md font-bold uppercase disabled:opacity-60">
        {saving ? 'Saving…' : 'Save sponsor page'}
      </button>
    </form>
  )
}

export default function AdminSponsors() {
  const [mainTab, setMainTab] = useState('packages')
  const [error, setError] = useState('')

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Sponsors</h1>
      <p className="body-md text-on-surface-variant mb-6 max-w-3xl">
        Manage sponsorship tiers for the sponsor page and homepage logo marquee. Sponsor form submissions are reviewed under Submissions.
      </p>

      <div className="flex gap-2 mb-8 flex-wrap">
        {MAIN_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setMainTab(t.id); setError('') }}
            className={`px-4 py-2 rounded-full label-md uppercase tracking-wider ${
              mainTab === t.id ? 'bg-primary-fixed text-on-primary-fixed font-bold' : 'border border-outline-variant/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

      {mainTab === 'packages' && <SponsorshipPackagesPanel onError={setError} />}
      {mainTab === 'benefits' && <BenefitRowsPanel onError={setError} />}
      {mainTab === 'page' && <SponsorPagePanel onError={setError} />}
      {mainTab === 'logos' && <HomepageLogosPanel onError={setError} />}
    </div>
  )
}
