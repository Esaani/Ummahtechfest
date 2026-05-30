import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, authApi } from '../api/client'
import AuthPageShell from '../components/AuthPageShell'
import HoneypotField from '../components/HoneypotField'
import { FormField, FormInput } from '../components/forms/FormField'
import { isValidEmail } from '../utils/formValidation'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await authApi.requestPasswordReset({ email: email.trim(), website: honeypot })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send reset email. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageShell
      title="Forgot your password?"
      subtitle="Enter the email you used to register. We will send a secure link to reset your password."
      footer={
        <p className="body-md text-on-surface-variant text-center md:text-left">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-fixed font-bold hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-primary-fixed/30 bg-primary-fixed/10 p-6 text-center md:text-left">
          <span className="material-symbols-outlined text-primary-fixed text-4xl mb-3">mark_email_read</span>
          <h2 className="headline-sm text-primary mb-2">Check your inbox</h2>
          <p className="body-md text-on-surface-variant">
            If an account exists for <strong className="text-on-surface">{email}</strong>, you will receive reset
            instructions shortly. The link expires in about an hour.
          </p>
          <p className="body-md text-on-surface-variant mt-4 text-sm">
            Did not receive it? Check spam or{' '}
            <button
              type="button"
              className="text-primary-fixed font-bold hover:underline"
              onClick={() => setSent(false)}
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 body-md" role="alert">
              {error}
            </div>
          )}
          <form className="space-y-6 relative" onSubmit={handleSubmit}>
            <HoneypotField value={honeypot} onChange={setHoneypot} />
            <FormField label="Email address" htmlFor="email" required>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-fixed transition-colors">
                  mail
                </span>
                <FormInput
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="pl-12 h-14"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  hasError={!!error}
                  required
                />
              </div>
            </FormField>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-fixed text-on-primary-fixed py-4 rounded-xl label-md font-bold uppercase tracking-widest hover:shadow-[0_0_30px_rgba(163,250,1,0.25)] disabled:opacity-60 transition-all"
            >
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </>
      )}
    </AuthPageShell>
  )
}
