import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ApiError, authApi, registrationsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useRegistration } from '../context/RegistrationContext'
import { getPass, isPassRegistrationPubliclyOpen } from '../config/passes'
import HoneypotField from '../components/HoneypotField'
import logo from '../assets/logo.png'
import { mapPassFromConfig, mapPassTypeFromApi } from '../utils/passHelpers'

function nextStepAfterAccount(pass, fromPath) {
  if (fromPath === '/speaker/apply' || fromPath === '/speaker/onboarding') return fromPath
  if (fromPath?.startsWith('/volunteer')) return '/volunteer/apply'
  if (!pass) return '/'
  if (pass.flow === 'volunteer') return '/volunteer/apply'
  if (!isPassRegistrationPubliclyOpen()) return '/volunteer'
  const slug = pass.slug || pass.id
  if (pass.flow === 'approval') return `/special-access?pass=${slug}`
  if (pass.flow === 'open') {
    if (pass.is_open_for_registration === false) return '/volunteer'
    return `/professional-details?pass=${slug}`
  }
  return '/volunteer'
}

export default function CreateAccount() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [signupToken, setSignupToken] = useState('')
  const [form, setForm] = useState({ first_name: '', last_name: '', password: '' })
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resolvedPass, setResolvedPass] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { selectedPass, setSelectedPass } = useRegistration()

  const passId = searchParams.get('pass') || selectedPass?.id
  const staticFallback = passId ? mapPassFromConfig(getPass(passId)) : null
  const pass = resolvedPass || staticFallback

  const volunteerFromState = location.state?.from?.startsWith?.('/volunteer')
  const redirectTo = location.state?.from || nextStepAfterAccount(pass, location.state?.from)
  const isVolunteerSignup = volunteerFromState || pass?.flow === 'volunteer'

  useEffect(() => {
    if (!passId) {
      setResolvedPass(null)
      return
    }
    let cancelled = false
    registrationsApi
      .passTypes()
      .then((res) => {
        if (cancelled) return
        const raw = (res.data || []).find((p) => p.slug === passId)
        setResolvedPass(raw ? mapPassTypeFromApi(raw) : null)
      })
      .catch(() => {
        if (!cancelled) setResolvedPass(null)
      })
    return () => {
      cancelled = true
    }
  }, [passId])

  useEffect(() => {
    const id = pass?.slug || pass?.id
    if (passId && id) setSelectedPass(id)
  }, [passId, pass?.slug, pass?.id, setSelectedPass])

  useEffect(() => {
    if (!passId || isVolunteerSignup) return
    if (!isPassRegistrationPubliclyOpen()) {
      navigate('/volunteer', { replace: true })
    }
  }, [passId, isVolunteerSignup, navigate])

  useEffect(() => {
    if (resendCooldown <= 0) return undefined
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      const res = await authApi.sendSignupOtp({ email, website: honeypot })
      setVerificationId(res.data.verification_id)
      setStep('otp')
      setResendCooldown(60)
      setInfo('We sent a 6-digit code to your email. Enter it below to continue.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send verification code.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmOtp = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      const res = await authApi.confirmSignupOtp({
        verification_id: verificationId,
        code: otp,
        website: honeypot,
      })
      setSignupToken(res.data.signup_token)
      setEmail(res.data.email)
      setStep('details')
      setInfo('Email verified. Complete your profile to finish signup.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      await authApi.resendSignupOtp({ verification_id: verificationId, website: honeypot })
      setResendCooldown(60)
      setInfo('A new code was sent to your email.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to resend code.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({
        signup_token: signupToken,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        website: honeypot,
      })
      navigate(redirectTo)
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        const errs = {}
        if (err.details.password) {
          errs.password = Array.isArray(err.details.password)
            ? err.details.password[0]
            : String(err.details.password)
        }
        if (err.details.first_name) {
          errs.first_name = Array.isArray(err.details.first_name)
            ? err.details.first_name[0]
            : String(err.details.first_name)
        }
        if (Object.keys(errs).length > 0) {
          setFieldErrors(errs)
        } else {
          setError(err.message)
        }
      } else {
        setError(err instanceof ApiError ? err.message : 'Unable to create account. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background">
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-surface-container-lowest relative overflow-hidden items-center justify-center px-margin-desktop">
        <div className="absolute inset-0 kente-tech-pattern z-0" />
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
            alt="Ummah Tech Fest community"
            src="/assets/images/umma-volunteer.webp"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl text-center md:text-left" data-aos="fade-right">
          <Link to="/" className="inline-flex items-center gap-base mb-8 group">
            <img src={logo} alt="Ummah Tech Fest" className="h-14 w-auto object-contain" />
            <div className="h-px w-12 bg-primary-fixed/30 group-hover:w-20 transition-all" />
          </Link>
          <h1 className="headline-xl mb-base text-primary">
            Cultivating Ihsaan in the <span className="text-primary-fixed">Digital Realm.</span>
          </h1>
          <p className="body-lg text-on-surface-variant max-w-lg">
            Join Ghana&apos;s premier gathering of tech visionaries and cultural pioneers.
          </p>
          {pass && (
            <p className="mt-6 label-md text-primary-fixed uppercase tracking-widest">{pass.title}</p>
          )}
        </div>
      </section>

      <section className="flex-1 flex flex-col justify-center items-center py-12 px-margin-mobile md:px-margin-desktop bg-surface-dim relative" data-aos="fade-left">
        <div className="md:hidden w-full text-center mb-12 flex justify-center">
          <Link to="/">
            <img src={logo} alt="Ummah Tech Fest" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        <div className="w-full max-w-md relative">
          <div className="mb-10 text-center md:text-left">
            <h2 className="headline-lg text-primary mb-2">
              {isVolunteerSignup ? 'Create account to volunteer' : 'Create Account'}
            </h2>
            <p className="body-md text-on-surface-variant">
              {step === 'email' && 'Verify your email first — we will send a one-time code.'}
              {step === 'otp' && `Enter the code we sent to ${email}.`}
              {step === 'details' && 'Almost done — set your name and password.'}
            </p>
          </div>

          {error && (
            <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">
              {error}
            </p>
          )}
          {info && !error && (
            <p className="mb-4 p-3 rounded-lg bg-primary-fixed/10 body-md text-on-surface-variant" role="status">
              {info}
            </p>
          )}

          <HoneypotField value={honeypot} onChange={setHoneypot} />

          {step === 'email' && (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div className="group">
                <label className="block label-md text-on-surface-variant mb-2">Email</label>
                <input
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-fixed/50"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <button
                className="w-full h-14 bg-primary-fixed text-on-primary-fixed label-md font-bold rounded-lg uppercase tracking-widest disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Sending code…' : 'Send verification code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form className="space-y-6" onSubmit={handleConfirmOtp}>
              <div className="group">
                <label className="block label-md text-on-surface-variant mb-2">Verification code</label>
                <input
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 text-on-surface text-center tracking-[0.4em] font-mono outline-none focus:ring-2 focus:ring-primary-fixed/50"
                  placeholder="000000"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoComplete="one-time-code"
                />
              </div>
              <button
                className="w-full h-14 bg-primary-fixed text-on-primary-fixed label-md font-bold rounded-lg uppercase tracking-widest disabled:opacity-60"
                type="submit"
                disabled={submitting || otp.length !== 6}
              >
                {submitting ? 'Verifying…' : 'Verify email'}
              </button>
              <button
                type="button"
                className="w-full body-md text-secondary-fixed hover:underline disabled:opacity-50"
                onClick={handleResendOtp}
                disabled={submitting || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
              </button>
              <button
                type="button"
                className="w-full body-sm text-on-surface-variant hover:text-on-surface"
                onClick={() => { setStep('email'); setOtp(''); setError(''); setInfo(''); setFieldErrors({}) }}
              >
                Use a different email
              </button>
            </form>
          )}

          {step === 'details' && (
            <form className="space-y-6" onSubmit={handleRegister}>
              <p className="body-sm text-on-surface-variant">Signing up as <strong>{email}</strong></p>
              <div className="group">
                <label className="block label-md text-on-surface-variant mb-2">First name</label>
                <input
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-fixed/50"
                  placeholder="First name"
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="group">
                <label className="block label-md text-on-surface-variant mb-2">Last name</label>
                <input
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-fixed/50"
                  placeholder="Last name"
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
              <div className="group">
                <label className="block label-md text-on-surface-variant mb-2">Password</label>
                <input
                  className={`w-full h-14 bg-surface-container-low border rounded-lg px-4 text-on-surface outline-none focus:ring-2 focus:ring-primary-fixed/50 ${fieldErrors.password ? 'border-error/50' : 'border-outline-variant/30'}`}
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors((p) => ({ ...p, password: '' })) }}
                  required
                  minLength={8}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-error flex items-center gap-1 mt-1" role="alert">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.password}
                  </p>
                )}
              </div>
              <button
                className="w-full h-14 bg-primary-fixed text-on-primary-fixed label-md font-bold rounded-lg uppercase tracking-widest disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          <div className="mt-10 text-center">
            <p className="body-md text-on-surface-variant">
              Already have an account?
              <Link
                className="text-secondary-fixed font-bold hover:underline ml-1"
                to="/login"
                state={{ from: redirectTo }}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
