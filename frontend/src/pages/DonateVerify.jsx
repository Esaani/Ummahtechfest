import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ApiError, paymentsApi } from '../api/client'

export default function DonateVerify() {
  const [searchParams] = useSearchParams()
  const reference = searchParams.get('reference') || ''
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reference) {
      setError('Missing payment reference.')
      setLoading(false)
      return
    }
    paymentsApi
      .verify(reference)
      .then((res) => setStatus(res.data?.status || ''))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to verify donation.'))
      .finally(() => setLoading(false))
  }, [reference])

  if (loading) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
        <p className="body-md text-on-surface-variant">Verifying your donation…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
        <p className="body-md text-error mb-6" role="alert">{error}</p>
        <Link to="/" className="btn-secondary px-8 py-3 rounded-full">
          Back to home
        </Link>
      </main>
    )
  }

  const success = status === 'success'

  return (
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center kente-pattern">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 mb-8">
        <span className="material-symbols-outlined text-primary-fixed text-4xl">
          {success ? 'favorite' : 'hourglass_top'}
        </span>
      </div>
      <h1 className="headline-lg text-primary mb-4">
        {success ? 'Thank you for your support' : 'Donation pending'}
      </h1>
      <p className="body-lg text-on-surface-variant mb-10">
        {success
          ? 'Your contribution helps us build the future of tech in the Ummah. JazakAllah khair.'
          : 'If you completed checkout, confirmation may take a moment. Refresh this page shortly.'}
      </p>
      <Link to="/" className="btn-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest">
        Back to home
      </Link>
    </main>
  )
}
