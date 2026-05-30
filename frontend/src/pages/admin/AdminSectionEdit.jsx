import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, cmsApi } from '../../api/client'

export default function AdminSectionEdit() {
  const { sectionId } = useParams()
  const navigate = useNavigate()
  const [section, setSection] = useState(null)
  const [contentJson, setContentJson] = useState('{}')
  const [isPublished, setIsPublished] = useState(true)
  const [error, setError] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    cmsApi
      .getSection(sectionId)
      .then((res) => {
        const found = res.data
        setSection(found)
        setContentJson(JSON.stringify(found.content || {}, null, 2))
        setIsPublished(found.is_published)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
  }, [sectionId])

  const handleSave = async (e) => {
    e.preventDefault()
    setJsonError('')
    setError('')
    let content
    try {
      content = JSON.parse(contentJson)
    } catch {
      setJsonError('Content must be valid JSON.')
      return
    }
    setSaving(true)
    try {
      await cmsApi.updateSection(sectionId, { content, is_published: isPublished })
      navigate('/admin/sections')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (!section && !error) {
    return <p className="body-md text-on-surface-variant">Loading…</p>
  }

  if (error && !section) {
    return (
      <div>
        <p className="text-error body-md mb-4">{error}</p>
        <Link to="/admin/sections" className="text-secondary-fixed label-md">← Back</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/admin/sections" className="label-md text-secondary-fixed hover:underline mb-6 inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Sections
      </Link>
      <h1 className="headline-lg text-primary mb-1">{section.label}</h1>
      <p className="label-md text-on-surface-variant mb-8">{section.slug} · {section.page}</p>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-5 h-5 accent-primary-fixed"
          />
          <span className="label-md">Published (visible on public site)</span>
        </label>

        <div>
          <label className="block label-md text-secondary uppercase tracking-wider mb-2">
            Content (JSON)
          </label>
          <textarea
            className="w-full min-h-[320px] font-mono text-sm bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-on-surface outline-none focus:border-primary-fixed"
            value={contentJson}
            onChange={(e) => setContentJson(e.target.value)}
            spellCheck={false}
          />
          {jsonError && <p className="mt-2 text-error body-md">{jsonError}</p>}
          <p className="mt-2 body-md text-on-surface-variant text-sm">
            Use image URLs from the media library or existing paths like /assets/images/hero.webp
          </p>
        </div>

        {error && <p className="p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-10 py-3 rounded-lg font-bold uppercase tracking-widest disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
