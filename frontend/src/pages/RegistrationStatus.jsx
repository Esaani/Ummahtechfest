import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, registrationsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = {
  pending_payment: { label: 'Pending payment', color: 'text-secondary' },
  paid: { label: 'Paid', color: 'text-primary-fixed' },
  submitted: { label: 'Under review', color: 'text-secondary' },
  approved: { label: 'Approved', color: 'text-primary-fixed' },
  rejected: { label: 'Not approved', color: 'text-error' },
}

export default function RegistrationStatus() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [data, setData] = useState(null)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) return
    registrationsApi
      .me()
      .then((res) => {
        setData(res.data)
        setMeta(res.meta)
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Unable to load registration.')
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, authLoading])

  if (authLoading || loading) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto">
        <p className="body-md text-on-surface-variant">Loading…</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
        <h1 className="headline-lg text-primary mb-4">Sign in to view registration</h1>
        <Link to="/login" state={{ from: '/registration/status' }} className="btn-primary px-8 py-3 rounded-full inline-block">
          Log in
        </Link>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto">
        <p className="body-md text-error mb-4" role="alert">{error}</p>
        <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </main>
    )
  }

  if (!meta?.has_registration || !data) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
        <h1 className="headline-lg text-primary mb-4">No pass registration yet</h1>
        <p className="body-lg text-on-surface-variant mb-8">Choose a pass to register for Ummah Tech Fest Ghana 2026.</p>
        <Link to="/signup" className="btn-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest">
          Choose a pass
        </Link>
      </main>
    )
  }

  const statusInfo = STATUS_LABELS[data.status] || { label: data.status, color: 'text-on-surface' }

  return (
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto">
      <h1 className="headline-lg text-primary mb-2">Your registration</h1>
      <p className="body-md text-on-surface-variant mb-8">Ghana 2026 Edition</p>

      <div className="glass-card p-8 rounded-2xl border border-outline-variant/30 space-y-6">
        <div>
          <p className="label-md text-on-surface-variant uppercase tracking-wider">Pass type</p>
          <p className="headline-sm text-primary-fixed">{data.pass_type?.name}</p>
        </div>
        <div>
          <p className="label-md text-on-surface-variant uppercase tracking-wider">Status</p>
          <p className={`headline-sm ${statusInfo.color}`}>{statusInfo.label}</p>
        </div>
        {data.organization && (
          <div>
            <p className="label-md text-on-surface-variant uppercase tracking-wider">Organization</p>
            <p className="body-lg">{data.organization}</p>
          </div>
        )}
        {data.job_title && (
          <div>
            <p className="label-md text-on-surface-variant uppercase tracking-wider">Role</p>
            <p className="body-lg">{data.job_title}</p>
          </div>
        )}
      </div>

      {data.status === 'pending_payment' && (
        <div className="mt-8 p-6 rounded-xl bg-primary-fixed/10 border border-primary-fixed/30">
          <p className="label-md text-primary-fixed font-bold mb-2">Payment required</p>
          <p className="body-md text-on-surface-variant mb-4">
            Complete your pass payment securely (card or mobile money).
          </p>
          <Link to="/payment" className="btn-primary px-6 py-3 rounded-full label-md font-bold inline-block">
            Pay now
          </Link>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/signup" className="btn-secondary px-6 py-3 rounded-full label-md font-bold">
          Pass types
        </Link>
        <Link to="/" className="label-md text-secondary-fixed hover:underline py-3">
          Back to home
        </Link>
      </div>
    </main>
  )
}
