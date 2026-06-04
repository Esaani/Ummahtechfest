import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ApiError, paymentsApi, registrationsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Payment() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    registrationsApi
      .me()
      .then((res) => setRegistration(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load registration.'))
      .finally(() => setLoading(false))
  }, [isAuthenticated, authLoading])

  const handlePay = async () => {
    setError('')
    setPaying(true)
    try {
      const res = await paymentsApi.initializePassPayment()
      const url = res.data?.authorization_url
      if (!url) {
        setError('Payment could not be started. Please try again.')
        return
      }
      window.location.href = url
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to start payment.')
    } finally {
      setPaying(false)
    }
  }

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
        <h1 className="headline-lg text-primary mb-4">Sign in to pay</h1>
        <Link to="/login" state={{ from: '/payment' }} className="btn-primary px-8 py-3 rounded-full inline-block">
          Log in
        </Link>
      </main>
    )
  }

  if (error && !registration) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto">
        <p className="body-md text-error mb-4" role="alert">{error}</p>
        <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </main>
    )
  }

  if (!registration || registration.status !== 'pending_payment') {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
        <h1 className="headline-lg text-primary mb-4">
          {registration?.status === 'paid' ? 'Already paid' : 'No payment due'}
        </h1>
        <p className="body-lg text-on-surface-variant mb-8">
          {registration?.status === 'paid'
            ? 'Your pass payment is confirmed.'
            : 'Complete registration first or check your status.'}
        </p>
        <Link to="/registration/status" className="btn-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest">
          View registration
        </Link>
      </main>
    )
  }

  const passName = registration.pass_type?.name || 'Event pass'
  const price = registration.pass_type?.price_ghs

  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto kente-pattern">
      <div className="glass-card p-8 md:p-10 rounded-2xl border border-outline-variant/30 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 mb-6">
          <span className="material-symbols-outlined text-primary-fixed text-3xl">payments</span>
          </div>
        <h1 className="headline-lg text-primary mb-2">Complete payment</h1>
        <p className="label-md text-secondary-fixed uppercase tracking-widest mb-6">{passName}</p>
        {price != null && (
          <p className="headline-sm text-primary-fixed mb-6">
            {Number(price).toLocaleString()} GHS
          </p>
        )}
        <p className="body-md text-on-surface-variant mb-8">
          You will be redirected to our secure payment gateway to pay with card or mobile money.
        </p>
        {error && (
          <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">
            {error}
          </p>
        )}
              <button 
          type="button"
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-primary-fixed text-on-primary-fixed px-8 py-4 rounded-lg label-md font-bold uppercase tracking-widest disabled:opacity-60 mb-4"
        >
          {paying ? 'Redirecting…' : 'Secure Payment'}
              </button>
        <Link to="/registration/status" className="label-md text-on-surface-variant hover:text-primary-fixed">
          View registration status
        </Link>
      </div>
    </main>
  )
}
