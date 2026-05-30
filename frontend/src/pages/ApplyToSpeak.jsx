import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, outreachApi } from '../api/client'
import HoneypotField from '../components/HoneypotField'
import ChoiceCards from '../components/forms/ChoiceCards'
import { FormField, FormInput, FormTextarea } from '../components/forms/FormField'
import RoleSelect, { roleToProfessionalTitle } from '../components/forms/RoleSelect'
import { validateSpeakerStep1, validateSpeakerStep2 } from '../utils/formValidation'

const DEFAULT_TRACKS = [
  { value: 'ethical_ai', label: 'Ethical AI' },
  { value: 'ummah_fintech', label: 'Ummah Fintech' },
  { value: 'web3_trust', label: 'Web3 & Trust' },
  { value: 'social_good', label: 'Tech for Social Good' },
  { value: 'global_connectivity', label: 'Global Connectivity' },
]

const DEFAULT_FORMATS = [
  { value: 'keynote', label: 'Keynote', description: '~45 min · main stage' },
  { value: 'workshop', label: 'Workshop', description: '~90 min · hands-on' },
  { value: 'panel', label: 'Panel', description: 'Moderated discussion' },
]

const STEPS = [
  { id: 1, label: 'About you' },
  { id: 2, label: 'Your talk' },
  { id: 3, label: 'Review' },
]

export default function ApplyToSpeak() {
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [tracks, setTracks] = useState(DEFAULT_TRACKS)
  const [formats, setFormats] = useState(DEFAULT_FORMATS)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    roleKey: '',
    roleCustom: '',
    organization: '',
    email: '',
    bio: '',
    sessionTitle: '',
    track: '',
    format: '',
    abstract: '',
    keyTakeaways: '',
    linkedin: '',
    twitter: '',
    techRequirements: '',
    coSpeakers: '',
  })

  useEffect(() => {
    outreachApi
      .options()
      .then((res) => {
        if (res.data?.speaker_tracks?.length) setTracks(res.data.speaker_tracks)
        if (res.data?.speaker_formats?.length) {
          setFormats(
            res.data.speaker_formats.map((f) => ({
              ...f,
              description: DEFAULT_FORMATS.find((d) => d.value === f.value)?.description,
            })),
          )
        }
      })
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const goNext = () => {
    const errs = step === 1 ? validateSpeakerStep1(formData) : validateSpeakerStep2(formData)
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!agreed) {
      setError('Please confirm the code of conduct and privacy policy.')
      return
    }
    const errs = { ...validateSpeakerStep1(formData), ...validateSpeakerStep2(formData) }
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      setError('Please fix the highlighted fields.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await outreachApi.submitSpeakerApplication({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        professional_title: roleToProfessionalTitle(formData.roleKey, formData.roleCustom),
        organization: formData.organization.trim(),
        bio: formData.bio.trim(),
        linkedin_url: formData.linkedin.trim(),
        twitter_handle: formData.twitter.trim(),
        session_title: formData.sessionTitle.trim(),
        track: formData.track,
        session_format: formData.format,
        abstract: formData.abstract.trim(),
        key_takeaways: formData.keyTakeaways.trim(),
        tech_requirements: formData.techRequirements.trim(),
        co_speakers: formData.coSpeakers.trim(),
        website: honeypot,
      })
      setIsSubmitted(true)
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <main className="pt-24 md:pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <span className="material-symbols-outlined text-primary-fixed text-6xl mb-6">check_circle</span>
        <h1 className="headline-lg text-primary mb-4 uppercase">Application received</h1>
        <p className="body-lg text-on-surface-variant max-w-xl mx-auto mb-8">
          Thank you for applying to speak at Ummah Tech Fest Ghana 2026. We sent a confirmation to your email and will
          notify you when the program committee has reviewed your submission.
        </p>
        <Link to="/" className="btn-primary inline-block">Back to home</Link>
      </main>
    )
  }

  const trackLabel = tracks.find((t) => t.value === formData.track)?.label || formData.track
  const formatLabel = formats.find((f) => f.value === formData.format)?.label || formData.format
  const roleLabel = roleToProfessionalTitle(formData.roleKey, formData.roleCustom)
  const progressWidth = step === 1 ? '0%' : `${((step - 1) / (STEPS.length - 1)) * 100}%`

  return (
    <main className="pt-24 md:pt-32 pb-20">
      <section className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop mb-10">
        <p className="label-md text-secondary uppercase tracking-widest mb-2">Call for speakers</p>
        <h1 className="headline-lg text-primary mb-3 uppercase">
          Apply to <span className="text-primary-fixed">Speak</span>
        </h1>
        <p className="body-md text-on-surface-variant max-w-xl">
          Three short steps — about you, your talk, then review and submit.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
        <nav className="relative mb-8" aria-label="Application progress">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-outline-variant/30" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary-fixed transition-all duration-500"
            style={{ width: progressWidth }}
          />
          <ol className="flex justify-between gap-2">
            {STEPS.map((s) => (
              <li key={s.id} className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > s.id
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : step === s.id
                        ? 'bg-primary-fixed text-on-primary-fixed ring-4 ring-primary-fixed/20'
                        : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/40'
                  }`}
                >
                  {step > s.id ? (
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  ) : (
                    s.id
                  )}
                </div>
                <span className="text-xs mt-2 text-center text-on-surface-variant font-medium truncate w-full">
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="glass-panel p-6 md:p-10 rounded-2xl border border-outline-variant/30">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 body-md" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8 relative">
            <HoneypotField value={honeypot} onChange={setHoneypot} />

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="headline-sm text-primary mb-1">About you</h2>
                  <p className="text-sm text-on-surface-variant">Tell us who you are and how to reach you.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="Full name" htmlFor="fullName" required error={fieldErrors.fullName}>
                    <FormInput
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleChange}
                      hasError={!!fieldErrors.fullName}
                    />
                  </FormField>
                  <FormField label="Work email" htmlFor="email" required error={fieldErrors.email}>
                    <FormInput
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      hasError={!!fieldErrors.email}
                    />
                  </FormField>
                  <RoleSelect
                    roleKey={formData.roleKey}
                    customRole={formData.roleCustom}
                    onRoleChange={(v) => setField('roleKey', v)}
                    onCustomChange={(v) => setField('roleCustom', v)}
                    error={fieldErrors.roleKey}
                  />
                  <FormField label="Organization" htmlFor="organization" required error={fieldErrors.organization}>
                    <FormInput
                      id="organization"
                      name="organization"
                      autoComplete="organization"
                      placeholder="Company, university, or community"
                      value={formData.organization}
                      onChange={handleChange}
                      hasError={!!fieldErrors.organization}
                    />
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField
                      label="Speaker bio"
                      htmlFor="bio"
                      hint="A short intro for the program committee (40+ characters)."
                      required
                      error={fieldErrors.bio}
                    >
                      <FormTextarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        hasError={!!fieldErrors.bio}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="headline-sm text-primary mb-1">Your talk</h2>
                  <p className="text-sm text-on-surface-variant">What you want to present at the festival.</p>
                </div>
                <FormField
                  label="Proposed talk title"
                  htmlFor="sessionTitle"
                  hint="The headline attendees will see in the schedule."
                  required
                  error={fieldErrors.sessionTitle}
                >
                  <FormInput
                    id="sessionTitle"
                    name="sessionTitle"
                    value={formData.sessionTitle}
                    onChange={handleChange}
                    hasError={!!fieldErrors.sessionTitle}
                  />
                </FormField>
                <FormField label="Conference track" required error={fieldErrors.track}>
                  <ChoiceCards
                    name="Conference track"
                    value={formData.track}
                    onChange={(v) => setField('track', v)}
                    options={tracks}
                    columns={2}
                  />
                </FormField>
                <FormField label="Session format" required error={fieldErrors.format}>
                  <ChoiceCards
                    name="Session format"
                    value={formData.format}
                    onChange={(v) => setField('format', v)}
                    options={formats}
                    columns={3}
                  />
                </FormField>
                <FormField
                  label="Abstract"
                  htmlFor="abstract"
                  hint="Summarize your talk for reviewers (80+ characters)."
                  required
                  error={fieldErrors.abstract}
                >
                  <FormTextarea
                    id="abstract"
                    name="abstract"
                    rows={5}
                    value={formData.abstract}
                    onChange={handleChange}
                    hasError={!!fieldErrors.abstract}
                  />
                </FormField>
                <FormField
                  label="Key takeaways"
                  htmlFor="keyTakeaways"
                  hint="What should attendees leave knowing? One point per line works well."
                  required
                  error={fieldErrors.keyTakeaways}
                >
                  <FormTextarea
                    id="keyTakeaways"
                    name="keyTakeaways"
                    rows={4}
                    value={formData.keyTakeaways}
                    onChange={handleChange}
                    hasError={!!fieldErrors.keyTakeaways}
                  />
                </FormField>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="headline-sm text-primary mb-1">Review & submit</h2>
                  <p className="text-sm text-on-surface-variant">Confirm your details before sending.</p>
                </div>
                <dl className="rounded-xl border border-outline-variant/30 divide-y divide-outline-variant/20 text-sm">
                  <div className="px-4 py-3 flex flex-col sm:flex-row sm:gap-4">
                    <dt className="text-on-surface-variant shrink-0 sm:w-28">Speaker</dt>
                    <dd className="text-on-surface font-medium">
                      {formData.fullName} · {roleLabel} at {formData.organization}
                    </dd>
                  </div>
                  <div className="px-4 py-3 flex flex-col sm:flex-row sm:gap-4">
                    <dt className="text-on-surface-variant shrink-0 sm:w-28">Talk</dt>
                    <dd className="text-on-surface">{formData.sessionTitle}</dd>
                  </div>
                  <div className="px-4 py-3 flex flex-col sm:flex-row sm:gap-4">
                    <dt className="text-on-surface-variant shrink-0 sm:w-28">Program</dt>
                    <dd className="text-on-surface">
                      {trackLabel} · {formatLabel}
                    </dd>
                  </div>
                </dl>
                <details className="rounded-xl border border-outline-variant/30 overflow-hidden">
                  <summary className="px-4 py-3 text-sm font-medium text-secondary cursor-pointer hover:bg-surface-container-high/50">
                    Optional — links & logistics
                  </summary>
                  <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-outline-variant/20">
                    <FormField label="LinkedIn" htmlFor="linkedin">
                      <FormInput id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/…" />
                    </FormField>
                    <FormField label="X (Twitter)" htmlFor="twitter">
                      <FormInput id="twitter" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="@handle" />
                    </FormField>
                    <div className="md:col-span-2">
                      <FormField label="Tech requirements" htmlFor="techRequirements" hint="AV, adapters, or room setup needs.">
                        <FormTextarea id="techRequirements" name="techRequirements" rows={2} value={formData.techRequirements} onChange={handleChange} />
                      </FormField>
                    </div>
                    <div className="md:col-span-2">
                      <FormField label="Co-speakers" htmlFor="coSpeakers">
                        <FormInput id="coSpeakers" name="coSpeakers" value={formData.coSpeakers} onChange={handleChange} />
                      </FormField>
                    </div>
                  </div>
                </details>
                <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-outline-variant/30 p-4 hover:border-outline-variant/50 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 rounded border-outline-variant accent-primary-fixed"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span className="text-sm text-on-surface-variant leading-relaxed">
                    I confirm this information is accurate and agree to the event code of conduct and privacy policy.
                  </span>
                </label>
              </div>
            )}

            <div className="flex justify-between gap-4 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                className={`btn-secondary text-sm py-3 px-6 ${step === 1 ? 'invisible' : ''}`}
                onClick={() => {
                  setStep((s) => s - 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Back
              </button>
              {step < 3 ? (
                <button type="button" className="btn-primary text-sm py-3 px-8" onClick={goNext}>
                  Continue
                </button>
              ) : (
                <button type="button" className="btn-primary text-sm py-3 px-8 disabled:opacity-60" disabled={submitting} onClick={handleSubmit}>
                  {submitting ? 'Submitting…' : 'Submit application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
