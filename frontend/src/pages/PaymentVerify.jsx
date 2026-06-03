import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ApiError, paymentsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function PaymentVerify() {
  const [searchParams] = useSearchParams()
  const reference = searchParams.get('reference') || ''
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!reference) {
      setError('Missing payment reference.')
      setLoading(false)
      return
    }
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    paymentsApi
      .verify(reference)
      .then((res) => setStatus(res.data?.status || ''))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to verify payment.'))
      .finally(() => setLoading(false))
  }, [reference, isAuthenticated, authLoading])

  if (authLoading || loading) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
        <p className="body-md text-on-surface-variant">Verifying payment…</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
        <h1 className="headline-lg text-primary mb-4">Sign in to verify payment</h1>
        <Link
          to="/login"
          state={{ from: `/payment/verify?reference=${encodeURIComponent(reference)}` }}
          className="btn-primary px-8 py-3 rounded-full inline-block"
        >
          Log in
        </Link>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
        <p className="body-md text-error mb-6" role="alert">{error}</p>
        <Link to="/payment" className="btn-secondary px-8 py-3 rounded-full">
          Try again
        </Link>
      </main>
    )
  }

  const success = status === 'success'

  return (
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center kente-pattern">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 mb-8">
        <span className="material-symbols-outlined text-primary-fixed text-4xl">
          {success ? 'check_circle' : 'hourglass_top'}
        </span>
      </div>
      <h1 className="headline-lg text-primary mb-4">
        {success ? 'Payment successful' : 'Payment pending'}
      </h1>
      <p className="body-lg text-on-surface-variant mb-10">
        {success
          ? 'Your pass is confirmed. We will see you at Ummah Tech Fest Ghana 2026.'
          : 'We could not confirm payment yet. If you completed checkout, check again in a few minutes.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/registration/status" className="btn-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest">
          View registration
        </Link>
        {!success && (
          <Link to="/payment" className="btn-secondary px-8 py-3 rounded-full font-bold uppercase tracking-widest">
            Pay again
          </Link>
        )}
      </div>
    </main>
  )
}
