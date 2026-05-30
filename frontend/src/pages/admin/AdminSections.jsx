import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, cmsApi } from '../../api/client'

const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'ghana_2026', label: 'Ghana 2026' },
  { id: 'global', label: 'Global' },
]

export default function AdminSections() {
  const [page, setPage] = useState('home')
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    cmsApi
      .adminSections(page)
      .then((res) => setSections(res.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load sections'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="headline-lg text-primary">Site sections</h1>
        <div className="flex gap-2 flex-wrap">
          {PAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPage(p.id)}
              className={`px-4 py-2 rounded-full label-md uppercase tracking-wider ${
                page === p.id
                  ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                  : 'border border-outline-variant/40 text-on-surface-variant'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

      {loading ? (
        <p className="body-md text-on-surface-variant">Loading…</p>
      ) : (
        <div className="space-y-3">
          {sections.map((s) => (
            <Link
              key={s.id}
              to={`/admin/sections/${s.id}`}
              className="glass-card flex items-center justify-between p-5 rounded-xl border border-outline-variant/30 hover:border-primary-fixed/40 transition-all"
            >
              <div>
                <p className="headline-sm text-primary">{s.label}</p>
                <p className="label-md text-on-surface-variant">{s.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`label-md px-3 py-1 rounded-full text-xs uppercase ${
                    s.is_published
                      ? 'bg-primary-fixed/20 text-primary-fixed'
                      : 'bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  {s.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
            </Link>
          ))}
          {sections.length === 0 && (
            <p className="body-md text-on-surface-variant">
              No sections for this page. Run{' '}
              <code className="text-primary-fixed">python manage.py seed</code>.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
