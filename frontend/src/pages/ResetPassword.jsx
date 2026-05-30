import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, authApi } from '../api/client'
import AuthPageShell from '../components/AuthPageShell'
import HoneypotField from '../components/HoneypotField'
import { FormField, FormInput } from '../components/forms/FormField'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const resetId = searchParams.get('id') || ''
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const linkInvalid = !resetId || !token

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await authApi.confirmPasswordReset({
        reset_id: resetId,
        token,
        password,
        password_confirm: passwordConfirm,
        website: honeypot,
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reset password. Please request a new link.')
    } finally {
      setSubmitting(false)
    }
  }

  if (linkInvalid) {
    return (
      <AuthPageShell
        title="Invalid reset link"
        subtitle="This link is missing information or has already been used."
        footer={
          <Link to="/forgot-password" className="btn-primary inline-block text-center w-full md:w-auto">
            Request a new link
          </Link>
        }
      >
        <p className="body-md text-on-surface-variant">
          Password reset links expire after one hour and can only be used once.
        </p>
      </AuthPageShell>
    )
  }

  if (done) {
    return (
      <AuthPageShell
        title="Password updated"
        subtitle="Your password has been changed successfully."
      >
        <div className="text-center md:text-left space-y-6">
          <span className="material-symbols-outlined text-primary-fixed text-5xl">check_circle</span>
          <button
            type="button"
            className="w-full bg-primary-fixed text-on-primary-fixed py-4 rounded-xl label-md font-bold uppercase tracking-widest"
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      title="Choose a new password"
      subtitle="Use at least 8 characters with a mix you have not used here before."
      footer={
        <p className="body-md text-on-surface-variant text-center md:text-left">
          <Link to="/login" className="text-primary-fixed font-bold hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 body-md" role="alert">
          {error}
        </div>
      )}
      <form className="space-y-5 relative" onSubmit={handleSubmit}>
        <HoneypotField value={honeypot} onChange={setHoneypot} />
        <FormField label="New password" htmlFor="password" required>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-fixed">
              lock
            </span>
            <FormInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="pl-12 pr-12 h-14"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary-fixed p-1"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </FormField>
        <FormField label="Confirm password" htmlFor="password_confirm" required>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-fixed">
              lock
            </span>
            <FormInput
              id="password_confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="pl-12 h-14"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
        </FormField>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-fixed text-on-primary-fixed py-4 rounded-xl label-md font-bold uppercase tracking-widest disabled:opacity-60"
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthPageShell>
  )
}
