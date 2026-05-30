import { useCallback, useEffect, useState } from 'react'
import { ApiError, cmsApi } from '../../api/client'
import MediaUploadField from '../../components/admin/MediaUploadField.jsx'

const EMPTY_CARD = { title: '', text: '', image_asset_id: null, image_url: '', image_preview: '' }

function heroFromContent(content = {}) {
  return {
    badge: content.badge || '',
    headline: content.headline || '',
    headline_highlight: content.headline_highlight || '',
    headline_suffix: content.headline_suffix || '',
    subtitle: content.subtitle || '',
    subtitle_mobile: content.subtitle_mobile || '',
    video_asset_id: content.video_asset_id || null,
    video_url: content.video_url || '',
    video_preview: content.video_url || '',
    poster_asset_id: content.poster_asset_id || null,
    poster_url: content.poster_url || '',
    poster_preview: content.poster_url || '',
  }
}

function heroToContent(form) {
  return {
    badge: form.badge,
    headline: form.headline,
    headline_highlight: form.headline_highlight,
    headline_suffix: form.headline_suffix,
    subtitle: form.subtitle,
    subtitle_mobile: form.subtitle_mobile,
    video_asset_id: form.video_asset_id,
    video_url: form.video_asset_id ? '' : form.video_url,
    poster_asset_id: form.poster_asset_id,
    poster_url: form.poster_asset_id ? '' : form.poster_url,
  }
}

function cardsFromContent(content = {}) {
  const cards = content.cards || []
  if (!cards.length) return [{ ...EMPTY_CARD }]
  return cards.map((c) => ({
    title: c.title || '',
    text: c.text || '',
    image_asset_id: c.image_asset_id || null,
    image_url: c.image_url || '',
    image_preview: c.image_url || '',
  }))
}

function cardsToContent(title, titleHighlight, cards) {
  return {
    title,
    title_highlight: titleHighlight,
    cards: cards.map((c) => ({
      title: c.title,
      text: c.text,
      image_asset_id: c.image_asset_id,
      image_url: c.image_asset_id ? '' : c.image_url,
    })),
  }
}

export default function AdminHomeContent() {
  const [heroSection, setHeroSection] = useState(null)
  const [whySection, setWhySection] = useState(null)
  const [heroForm, setHeroForm] = useState(heroFromContent())
  const [whyTitle, setWhyTitle] = useState('Why we')
  const [whyHighlight, setWhyHighlight] = useState('build')
  const [whyCards, setWhyCards] = useState([{ ...EMPTY_CARD }])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    cmsApi
      .adminSections('home')
      .then((res) => {
        const list = res.data || []
        const hero = list.find((s) => s.slug === 'home-hero')
        const why = list.find((s) => s.slug === 'home-why-build')
        setHeroSection(hero || null)
        setWhySection(why || null)
        if (hero) setHeroForm(heroFromContent(hero.content))
        if (why) {
          setWhyTitle(why.content?.title || 'Why we')
          setWhyHighlight(why.content?.title_highlight || 'build')
          setWhyCards(cardsFromContent(why.content))
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!heroSection || !whySection) {
      setError('Home sections missing. Run: python manage.py seed')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await cmsApi.updateSection(heroSection.id, { content: heroToContent(heroForm) })
      await cmsApi.updateSection(whySection.id, {
        content: cardsToContent(whyTitle, whyHighlight, whyCards),
      })
      setMessage('Homepage saved. Changes appear on the site within a few minutes (or immediately if cache is off).')
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const updateCard = (index, patch) => {
    setWhyCards((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  if (loading) {
    return <p className="body-md text-on-surface-variant">Loading…</p>
  }

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Homepage content</h1>
      <p className="body-md text-on-surface-variant mb-8 max-w-2xl">
        Upload the hero video and &quot;Why we build&quot; images here. Files are stored in your media bucket (R2 when configured) — not in the app download.
      </p>

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}
      {message && <p className="mb-4 p-3 rounded-lg bg-primary-fixed/10 body-md text-primary-fixed">{message}</p>}

      <form onSubmit={handleSave} className="space-y-10">
        <section className="glass-card p-6 rounded-2xl border border-outline-variant/30 space-y-4">
          <h2 className="headline-sm text-primary">Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block md:col-span-2">
              <span className="label-md text-on-surface-variant mb-1 block">Badge</span>
              <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={heroForm.badge} onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })} />
            </label>
            <label className="block">
              <span className="label-md text-on-surface-variant mb-1 block">Headline (line 1)</span>
              <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={heroForm.headline} onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })} />
            </label>
            <label className="block">
              <span className="label-md text-on-surface-variant mb-1 block">Headline highlight (green)</span>
              <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={heroForm.headline_highlight} onChange={(e) => setHeroForm({ ...heroForm, headline_highlight: e.target.value })} />
            </label>
            <label className="block md:col-span-2">
              <span className="label-md text-on-surface-variant mb-1 block">Headline suffix</span>
              <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={heroForm.headline_suffix} onChange={(e) => setHeroForm({ ...heroForm, headline_suffix: e.target.value })} />
            </label>
            <label className="block md:col-span-2">
              <span className="label-md text-on-surface-variant mb-1 block">Subtitle (desktop)</span>
              <textarea className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30" rows={2} value={heroForm.subtitle} onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })} />
            </label>
          </div>
          <MediaUploadField
            label="Hero background video"
            folder="home"
            accept="video/mp4,video/webm,video/quicktime"
            hint="MP4 recommended · max 100MB"
            previewType="video"
            previewUrl={heroForm.video_preview || heroForm.video_url}
            showUrlFallback
            optionalUrl={heroForm.video_url}
            onOptionalUrlChange={(url) => setHeroForm({
              ...heroForm,
              video_url: url,
              video_asset_id: url ? null : heroForm.video_asset_id,
              video_preview: url || heroForm.video_preview,
            })}
            onChange={({ assetId, url }) => setHeroForm({
              ...heroForm,
              video_asset_id: assetId,
              video_preview: url,
              video_url: assetId ? '' : heroForm.video_url,
            })}
          />
          <MediaUploadField
            label="Poster image (shown before video loads)"
            folder="home"
            accept="image/*"
            previewUrl={heroForm.poster_preview}
            onChange={({ assetId, url }) => setHeroForm({ ...heroForm, poster_asset_id: assetId, poster_preview: url, poster_url: assetId ? '' : heroForm.poster_url })}
          />
        </section>

        <section className="glass-card p-6 rounded-2xl border border-outline-variant/30 space-y-6">
          <h2 className="headline-sm text-primary">Why we build</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="label-md text-on-surface-variant mb-1 block">Section title</span>
              <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={whyTitle} onChange={(e) => setWhyTitle(e.target.value)} />
            </label>
            <label className="block">
              <span className="label-md text-on-surface-variant mb-1 block">Title highlight (green)</span>
              <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={whyHighlight} onChange={(e) => setWhyHighlight(e.target.value)} />
            </label>
          </div>

          {whyCards.map((card, index) => (
            <div key={index} className="border border-outline-variant/20 rounded-xl p-4 space-y-3">
              <p className="label-md text-primary font-bold">Card {index + 1}</p>
              <label className="block">
                <span className="label-md text-on-surface-variant mb-1 block">Title</span>
                <input className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30" value={card.title} onChange={(e) => updateCard(index, { title: e.target.value })} />
              </label>
              <label className="block">
                <span className="label-md text-on-surface-variant mb-1 block">Text</span>
                <textarea className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30" rows={3} value={card.text} onChange={(e) => updateCard(index, { text: e.target.value })} />
              </label>
              <MediaUploadField
                label="Card image"
                folder="home"
                accept="image/*"
                previewUrl={card.image_preview}
                onChange={({ assetId, url }) => updateCard(index, {
                  image_asset_id: assetId,
                  image_preview: url,
                  image_url: assetId ? '' : card.image_url,
                })}
              />
            </div>
          ))}

          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-outline-variant/40 label-md"
            onClick={() => setWhyCards((prev) => [...prev, { ...EMPTY_CARD }])}
          >
            Add card
          </button>
        </section>

        <button type="submit" disabled={saving} className="btn-primary px-10 py-3 rounded-lg font-bold uppercase tracking-widest disabled:opacity-60">
          {saving ? 'Saving…' : 'Save homepage'}
        </button>
      </form>
    </div>
  )
}
