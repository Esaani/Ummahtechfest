import { useEffect, useMemo, useState } from 'react'
import { cmsApi } from '../api/client'

/**
 * Load published CMS sections for a page. Returns a map slug -> content object.
 */
export function useCmsSections(page) {
  const [sections, setSections] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    cmsApi
      .publicSections(page)
      .then((res) => {
        if (cancelled) return
        const map = {}
        for (const s of res.data || []) {
          map[s.slug] = s.content || {}
        }
        setSections(map)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page])

  const get = useMemo(
    () => (slug, fallback = {}) => sections[slug] ?? fallback,
    [sections],
  )

  return { sections, get, loading, error }
}
