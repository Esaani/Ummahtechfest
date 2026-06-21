import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, volunteerApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = {
  submitted: 'Submitted — awaiting review',
  under_review: 'Under review by our team',
  interview: 'Interview scheduled',
  accepted: 'Accepted',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
}

export default function VolunteerStatus() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [app, setApp] = useState(null)
  const [meta, setMeta] = useState({ can_apply: true, can_withdraw: false, has_application: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  const load = () => {
    setLoading(true)
    volunteerApi
      .myApplication()
      .then((res) => {
        setApp(res.data)
        setMeta(res.meta || {})
      })
      .catch(() => setError('Unable to load your application.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login', { state: { from: '/volunteer/status' } })
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated])

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw your application? You will not be able to submit again.')) return
    setWithdrawing(true)
    setError('')
    try {
      const res = await volunteerApi.withdraw()
      setApp(res.data)
      setMeta(res.meta || {})
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not withdraw application.')
    } finally {
      setWithdrawing(false)
    }
  }

  const canWithdraw = meta.can_withdraw ?? app?.can_withdraw ?? false
  const infoMessage = location.state?.message

  if (authLoading || loading) {
    return (
      <main className="pt-32 pb-20 text-center">
        <p className="text-on-surface-variant">Loading...</p>
      </main>
    )
  }

  if (!app) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <h1 className="headline-md text-primary mb-4">No application yet</h1>
        <p className="body-md text-on-surface-variant mb-8">You have not submitted a volunteer application.</p>
        <Link to="/volunteer/apply" className="btn-primary inline-flex px-8 py-3 rounded-full">
          Apply to volunteer
        </Link>
      </main>
    )
  }

  return (
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto">
      <h1 className="headline-lg text-primary mb-6">Application Status</h1>

      {infoMessage && (
        <p className="mb-4 p-4 rounded-xl bg-primary-fixed/10 border border-primary-fixed/30 body-md text-on-surface">
          {infoMessage}
        </p>
      )}

      {error && <p className="mb-4 text-error" role="alert">{error}</p>}

      <div className="glass-card p-8 rounded-2xl border border-outline-variant/30 space-y-4">
        <p className="headline-sm text-primary-fixed">{STATUS_LABELS[app.status] || app.status}</p>
        <p className="body-md text-on-surface-variant">
          Submitted {new Date(app.created_at).toLocaleDateString()}
        </p>
        {app.preferred_roles?.length > 0 && (
          <p className="body-md">
            Pathways: {app.preferred_roles.map((p) => p.name).join(', ')}
          </p>
        )}

        {app.status === 'accepted' && (
          <div className="mt-2">
            <Link
              to="/volunteer/portal"
              className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-full label-md font-bold"
            >
              <span className="material-symbols-outlined text-lg">open_in_new</span>
              Go to volunteer portal
            </Link>
          </div>
        )}

        {app.status === 'submitted' && (
          <p className="body-md text-on-surface-variant text-sm">
            You may withdraw while your application is awaiting review. Once our team begins review, withdrawal is no longer available.
          </p>
        )}

        {app.status === 'withdrawn' && (
          <p className="body-md text-on-surface-variant text-sm">
            This application was withdrawn. Each person may apply only once, so a new application cannot be submitted.
          </p>
        )}

        {canWithdraw && (
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="mt-4 px-6 py-2 border border-outline-variant/50 rounded-lg label-md disabled:opacity-50"
          >
            {withdrawing ? 'Withdrawing...' : 'Withdraw application'}
          </button>
        )}
      </div>

      <Link to="/volunteer" className="inline-block mt-8 text-primary-fixed label-md">
        ← Back to program
      </Link>
    </main>
  )
}
