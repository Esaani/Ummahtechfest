import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { registrationsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useRegistration } from '../context/RegistrationContext'
import { mapPassTypeFromApi } from '../utils/passHelpers'

/**
 * Loads pass from API by ?pass= slug, validates flow and open-registration flag.
 */
export default function PassRegistrationGate({ children, expectedFlow }) {
  const [searchParams] = useSearchParams()
  const { setSelectedPass } = useRegistration()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [loadingPass, setLoadingPass] = useState(true)
  const [meChecked, setMeChecked] = useState(false)
  const [pass, setPass] = useState(null)

  const passId = searchParams.get('pass')

  useEffect(() => {
    if (!passId) {
      navigate('/signup', { replace: true })
      return
    }
    let cancelled = false
    setLoadingPass(true)
    registrationsApi
      .passTypes()
      .then((res) => {
        if (cancelled) return
        const raw = (res.data || []).find((p) => p.slug === passId)
        if (!raw) {
          navigate('/signup', { replace: true })
          return
        }
        const mapped = mapPassTypeFromApi(raw)
        setPass(mapped)
        setSelectedPass(mapped.slug)
      })
      .catch(() => {
        if (!cancelled) navigate('/signup', { replace: true })
      })
      .finally(() => {
        if (!cancelled) setLoadingPass(false)
      })
    return () => {
      cancelled = true
    }
  }, [passId, navigate, setSelectedPass])

  useEffect(() => {
    if (loadingPass || !pass) return

    if (!pass.wired || pass.flow !== expectedFlow) {
      navigate('/signup', { replace: true })
      return
    }

    if (expectedFlow === 'open' && pass.is_open_for_registration === false) {
      navigate('/signup', { replace: true })
      return
    }

    if (authLoading) return

    if (!isAuthenticated) {
      const returnTo = `${window.location.pathname}${window.location.search}`
      navigate('/login', { state: { from: returnTo }, replace: true })
      return
    }

    let cancelled = false
    setMeChecked(false)
    registrationsApi
      .me()
      .then((res) => {
        if (cancelled) return
        if (res.meta?.has_registration) {
          navigate('/registration/status', { replace: true })
          return
        }
        setMeChecked(true)
      })
      .catch(() => {
        if (!cancelled) setMeChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [pass, loadingPass, expectedFlow, isAuthenticated, authLoading, navigate])

  if (!passId || loadingPass || !pass || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="body-md text-on-surface-variant">Loading registration…</p>
      </div>
    )
  }

  if (!pass.wired || pass.flow !== expectedFlow) return null
  if (expectedFlow === 'open' && pass.is_open_for_registration === false) return null
  if (!isAuthenticated || !meChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="body-md text-on-surface-variant">Loading registration…</p>
      </div>
    )
  }

  return children(pass)
}

export function SelectedPassBanner({ pass }) {
  if (!pass) return null
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 p-4 rounded-xl bg-primary-fixed/10 border border-primary-fixed/20">
      <span className="material-symbols-outlined text-primary-fixed">{pass.icon}</span>
      <div>
        <p className="label-md text-on-surface-variant uppercase tracking-wider">Selected pass</p>
        <p className="headline-sm text-primary-fixed">{pass.title}</p>
      </div>
      <Link to="/signup" className="ml-auto label-md text-secondary-fixed hover:underline">
        Change pass
      </Link>
    </div>
  )
}
