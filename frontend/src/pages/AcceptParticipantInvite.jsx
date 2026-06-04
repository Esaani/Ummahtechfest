import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, authApi } from '../api/client'
import AuthPageShell from '../components/AuthPageShell'
import { FormField, FormInput } from '../components/forms/FormField'

export default function AcceptParticipantInvite() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const inviteId = searchParams.get('id') || ''
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const linkInvalid = !inviteId || !token

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
      const res = await authApi.acceptParticipantInvite({
        invite_id: inviteId,
        token,
        password,
        password_confirm: passwordConfirm,
      })
      localStorage.setItem('access_token', res.tokens.access)
      localStorage.setItem('refresh_token', res.tokens.refresh)
      navigate(res.meta?.next_path || '/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to accept invite. Request a new invitation.')
    } finally {
      setSubmitting(false)
    }
  }

  if (linkInvalid) {
    return (
      <AuthPageShell
        title="Invalid invite link"
        subtitle="This invitation link is incomplete or has already been used."
      >
        <p className="body-md text-on-surface-variant">
          Ask the Ummah Tech Fest team to send a new invitation.
        </p>
        <Link to="/login" className="btn-primary inline-block mt-6 px-8 py-3 rounded-full">
          Sign in
        </Link>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      title="Accept your invitation"
      subtitle="Set a password to access your account and complete the next steps."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}
        <FormField label="Password" htmlFor="password">
          <div className="relative">
            <FormInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </FormField>
        <FormField label="Confirm password" htmlFor="password_confirm">
          <FormInput
            id="password_confirm"
            type={showPassword ? 'text' : 'password'}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </FormField>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-fixed text-on-primary-fixed py-4 rounded-xl label-md font-bold uppercase tracking-widest disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </AuthPageShell>
  )
}
