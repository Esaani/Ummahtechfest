import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, volunteerApi } from '../api/client'
import HoneypotField from '../components/HoneypotField'
import VolunteerApplyGate from '../components/VolunteerApplyGate.jsx'
import { useAuth } from '../context/AuthContext'

/**
 * Converts API error.details (field → [ErrorDetail, ...]) into a list of
 * human-readable strings safe to show directly to the user.
 * e.g. { profile_photo: ['Profile photo must be 5MB or smaller.'] }
 *   → ['Profile photo: Profile photo must be 5MB or smaller.']
 */
function formatApiErrors(details) {
  if (!details || typeof details !== 'object') return []
  const FIELD_LABELS = {
    profile_photo: 'Profile photo',
    cv: 'CV / Resume',
    phone: 'Phone',
    city: 'City',
    country: 'Country',
    occupation: 'Occupation',
    skills_summary: 'Skills summary',
    motivation: 'Motivation',
    preferred_role_ids: 'Pathways',
    code_of_conduct_accepted: 'Code of conduct',
    availability: 'Availability',
    non_field_errors: null,
  }
  return Object.entries(details).flatMap(([field, msgs]) => {
    const label = FIELD_LABELS[field] ?? field.replace(/_/g, ' ')
    const messages = Array.isArray(msgs) ? msgs : [String(msgs)]
    return messages.map((m) => {
      // Strip DRF's ErrorDetail wrapper if serialised as a string
      const text = String(m).replace(/^ErrorDetail\(string='(.+)',.*\)$/, '$1')
      return label ? `${label}: ${text}` : text
    })
  })
}

const STEPS = [
  { id: 1, label: 'Pathways' },
  { id: 2, label: 'Contact' },
  { id: 3, label: 'Experience' },
  { id: 4, label: 'Availability' },
  { id: 5, label: 'Review' },
]

const AVAILABILITY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const CATEGORY_LABELS = {
  event_support: 'Event & Community Support',
  creative_media: 'Creative & Multimedia',
  tech_training: 'Technical & Training',
}

const INITIAL_FORM = {
  phone: '',
  city: '',
  country: 'Ghana',
  occupation: '',
  skills_summary: '',
  motivation: '',
  experience_years: 0,
  portfolio_url: '',
  linkedin_url: '',
  availability: { days: [] },
  preferred_role_ids: [],
  code_of_conduct_accepted: false,
  cv: null,
  cvName: '',
  profile_photo: null,
  profilePhotoPreview: '',
}

export default function VolunteerApply() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [pathways, setPathways] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errorDetails, setErrorDetails] = useState([])
  const [fieldErrors, setFieldErrors] = useState({})
  const [form, setForm] = useState(INITIAL_FORM)
  const [honeypot, setHoneypot] = useState('')

  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    Promise.all([volunteerApi.listPathways(), volunteerApi.myApplication()])
      .then(([pathwaysRes, meRes]) => {
        if (meRes.meta?.has_application || meRes.data) {
          navigate('/volunteer/status', { replace: true, state: { message: 'You have already submitted an application.' } })
          return
        }
        setPathways(pathwaysRes.data || [])
      })
      .catch(() => setError('Unable to load volunteer pathways. Please try again.'))
      .finally(() => setLoading(false))
  }, [authLoading, isAuthenticated, navigate])

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }))
  const clearFieldError = (field) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const togglePathway = (id) => {
    setForm((f) => ({
      ...f,
      preferred_role_ids: f.preferred_role_ids.includes(id)
        ? f.preferred_role_ids.filter((p) => p !== id)
        : [...f.preferred_role_ids, id],
    }))
  }

  const toggleDay = (day) => {
    setForm((f) => {
      const days = f.availability?.days || []
      const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
      return { ...f, availability: { ...f.availability, days: next } }
    })
  }

  const selectedPathways = pathways.filter((p) => form.preferred_role_ids.includes(p.id))

  const validateStep = (currentStep) => {
    setErrorDetails([])
    const errs = {}

    switch (currentStep) {
      case 1:
        if (form.preferred_role_ids.length === 0) {
          setError('Select at least one pathway you are interested in.')
          setFieldErrors({})
          return false
        }
        break
      case 2:
        if (!form.city.trim()) errs.city = 'City is required.'
        if (!form.country.trim()) errs.country = 'Country is required.'
        if (!form.occupation.trim()) errs.occupation = 'Occupation is required.'
        break
      case 3:
        if (!form.skills_summary.trim()) errs.skills_summary = 'Please describe your skills and experience.'
        if (!form.motivation.trim()) errs.motivation = 'Please share your motivation to volunteer.'
        if (!form.cv) errs.cv = 'Please upload your CV or Resume (PDF or Word).'
        else if (form.cv.size > 10 * 1024 * 1024) errs.cv = 'CV must be 10 MB or smaller. Please choose a smaller file.'
        if (!form.profile_photo) errs.profile_photo = 'Please upload a profile photo.'
        else if (form.profile_photo.size > 5 * 1024 * 1024) errs.profile_photo = 'Profile photo must be 5 MB or smaller. Please choose a smaller image.'
        break
      case 4:
        if (!(form.availability?.days?.length > 0)) {
          setError('Select at least one day you are available.')
          setFieldErrors({})
          return false
        }
        break
      case 5:
        if (!form.code_of_conduct_accepted) {
          setError('You must accept the code of conduct to submit.')
          setFieldErrors({})
          return false
        }
        break
      default:
        break
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setError('Please fix the highlighted fields below.')
      return false
    }

    setFieldErrors({})
    setError('')
    return true
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(STEPS.length, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setError('')
    setFieldErrors({})
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(5)) return
    setError('')
    setSubmitting(true)
    try {
      const body = new FormData()
      body.append('phone', form.phone)
      body.append('city', form.city)
      body.append('country', form.country)
      body.append('occupation', form.occupation)
      body.append('skills_summary', form.skills_summary)
      body.append('motivation', form.motivation)
      body.append('experience_years', Number(form.experience_years) || 0)
      body.append('portfolio_url', form.portfolio_url)
      body.append('linkedin_url', form.linkedin_url)
      body.append('code_of_conduct_accepted', form.code_of_conduct_accepted)
      body.append('availability', JSON.stringify(form.availability))
      form.preferred_role_ids.forEach(id => body.append('preferred_role_ids', id))
      if (form.cv) body.append('cv', form.cv)
      if (form.profile_photo) body.append('profile_photo', form.profile_photo)
      if (honeypot) body.append('website', honeypot)

      await volunteerApi.submitApplication(body)
      navigate('/volunteer/status')
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        const FIELD_MAP = {
          phone: 'phone',
          city: 'city',
          country: 'country',
          occupation: 'occupation',
          skills_summary: 'skills_summary',
          motivation: 'motivation',
          cv: 'cv',
          profile_photo: 'profile_photo',
          preferred_role_ids: 'preferred_role_ids',
          code_of_conduct_accepted: 'code_of_conduct_accepted',
        }
        const mapped = {}
        for (const [key, msgs] of Object.entries(err.details)) {
          const formKey = FIELD_MAP[key] || key
          mapped[formKey] = Array.isArray(msgs) ? msgs[0] : String(msgs)
        }
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped)
          setError('Please fix the highlighted fields below.')
          setErrorDetails([])
        } else {
          const bullets = formatApiErrors(err.details)
          setError(bullets.length > 0 ? 'Please fix the following issues:' : err.message)
          setErrorDetails(bullets.length > 0 ? bullets : [])
          setFieldErrors({})
        }
      } else {
        setError(err instanceof ApiError ? err.message : 'Submission failed. Please try again.')
        setFieldErrors({})
        setErrorDetails([])
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <main className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <p className="body-lg text-on-surface-variant">Loading...</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <VolunteerApplyGate />
  }

  if (loading) {
    return (
      <main className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <p className="body-lg text-on-surface-variant">Loading...</p>
      </main>
    )
  }

  const progressWidth = step === 1 ? '0%' : `${((step - 1) / (STEPS.length - 1)) * 100}%`

  return (
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto">
      <header className="mb-10">
        <Link to="/volunteer" className="label-md text-primary-fixed hover:underline">
          ← Volunteer Program
        </Link>
        <h1 className="headline-lg text-primary mt-4 mb-2">Volunteer Application</h1>
        <p className="body-md text-on-surface-variant">
          {step === 5 ? 'Review your details before submitting.' : 'Complete each step to join the volunteer team.'}
        </p>
      </header>

      {/* Step indicator */}
      <nav className="relative mb-10" aria-label="Application progress">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-outline-variant/30 -z-10" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary-fixed -z-10 transition-all duration-500"
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
                      : 'bg-surface-container-low text-on-surface-variant'
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
              <span className="label-md text-[10px] md:text-xs mt-2 text-center uppercase tracking-wider text-on-surface-variant truncate w-full">
                {s.label}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-on-surface" role="alert">
          <p className="font-semibold">{error}</p>
          {errorDetails.length > 0 && (
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-on-surface-variant">
              {errorDetails.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()} className="glass-card p-8 rounded-2xl border border-outline-variant/30 relative">
        <HoneypotField value={honeypot} onChange={setHoneypot} />
        {/* Step 1: Pathways */}
        {step === 1 && (
          <div className="space-y-6" data-aos="fade-up">
            <div>
              <h2 className="headline-sm text-primary-fixed mb-2">Choose your pathways</h2>
              <p className="body-md text-on-surface-variant">
                Select the areas where you would like to contribute. You may choose more than one.
              </p>
            </div>
            <div className="grid gap-3 max-h-[420px] overflow-y-auto pr-1">
              {pathways.map((pathway) => (
                <label
                  key={pathway.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    form.preferred_role_ids.includes(pathway.id)
                      ? 'border-primary-fixed/50 bg-primary-fixed/10'
                      : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.preferred_role_ids.includes(pathway.id)}
                    onChange={() => togglePathway(pathway.id)}
                  />
                  <div>
                    <span className="body-md font-bold text-on-surface block">{pathway.name}</span>
                    <span className="label-md text-primary-fixed uppercase tracking-wider text-[10px]">
                      {CATEGORY_LABELS[pathway.category] || pathway.category}
                    </span>
                    {pathway.description && (
                      <p className="body-md text-on-surface-variant text-sm mt-1">{pathway.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="space-y-6" data-aos="fade-up">
            <h2 className="headline-sm text-primary-fixed mb-2">Contact details</h2>
            <div className="space-y-4">
              <div>
                <label className="label-md uppercase tracking-widest text-secondary block mb-2">Phone</label>
                <input
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 text-on-surface"
                  value={form.phone}
                  onChange={(e) => updateForm({ phone: e.target.value })}
                  placeholder="+233..."
                  type="tel"
                />
              </div>
              <div>
                <label className="label-md uppercase tracking-widest text-secondary block mb-2">City</label>
                <input
                  className={`w-full h-14 bg-surface-container-low border rounded-lg px-4 text-on-surface ${fieldErrors.city ? 'border-error/50' : 'border-outline-variant/30'}`}
                  value={form.city}
                  onChange={(e) => { updateForm({ city: e.target.value }); clearFieldError('city') }}
                  required
                />
                {fieldErrors.city && (
                  <p className="text-xs text-error flex items-center gap-1 mt-1" role="alert">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.city}
                  </p>
                )}
              </div>
              <div>
                <label className="label-md uppercase tracking-widest text-secondary block mb-2">Country</label>
                <input
                  className={`w-full h-14 bg-surface-container-low border rounded-lg px-4 text-on-surface ${fieldErrors.country ? 'border-error/50' : 'border-outline-variant/30'}`}
                  value={form.country}
                  onChange={(e) => { updateForm({ country: e.target.value }); clearFieldError('country') }}
                  required
                />
                {fieldErrors.country && (
                  <p className="text-xs text-error flex items-center gap-1 mt-1" role="alert">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.country}
                  </p>
                )}
              </div>
              <div>
                <label className="label-md uppercase tracking-widest text-secondary block mb-2">Occupation</label>
                <input
                  className={`w-full h-14 bg-surface-container-low border rounded-lg px-4 text-on-surface ${fieldErrors.occupation ? 'border-error/50' : 'border-outline-variant/30'}`}
                  value={form.occupation}
                  onChange={(e) => { updateForm({ occupation: e.target.value }); clearFieldError('occupation') }}
                  placeholder="e.g. Software Engineer, Student"
                  required
                />
                {fieldErrors.occupation && (
                  <p className="text-xs text-error flex items-center gap-1 mt-1" role="alert">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.occupation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Experience */}
        {step === 3 && (
          <div className="space-y-6" data-aos="fade-up">
            <h2 className="headline-sm text-primary-fixed mb-2">Skills & motivation</h2>
            <div>
              <label className="label-md uppercase tracking-widest text-secondary block mb-2">Years of relevant experience</label>
              <input
                className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 text-on-surface"
                type="number"
                min={0}
                max={50}
                value={form.experience_years}
                onChange={(e) => updateForm({ experience_years: e.target.value })}
              />
            </div>
            <div>
              <label className="label-md uppercase tracking-widest text-secondary block mb-2">
                Skills summary <span className="text-primary-fixed ml-0.5" aria-hidden="true">*</span>
              </label>
              <textarea
                className={`w-full min-h-28 bg-surface-container-low border rounded-lg p-4 text-on-surface ${fieldErrors.skills_summary ? 'border-error/50' : 'border-outline-variant/30'}`}
                value={form.skills_summary}
                onChange={(e) => { updateForm({ skills_summary: e.target.value }); clearFieldError('skills_summary') }}
                placeholder="Design, event coordination, video editing..."
                required
              />
              {fieldErrors.skills_summary && (
                <p className="text-xs text-error flex items-center gap-1 mt-1" role="alert">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {fieldErrors.skills_summary}
                </p>
              )}
            </div>
            <div>
              <label className="label-md uppercase tracking-widest text-secondary block mb-2">
                Why do you want to volunteer? <span className="text-primary-fixed ml-0.5" aria-hidden="true">*</span>
              </label>
              <textarea
                className={`w-full min-h-28 bg-surface-container-low border rounded-lg p-4 text-on-surface ${fieldErrors.motivation ? 'border-error/50' : 'border-outline-variant/30'}`}
                value={form.motivation}
                onChange={(e) => { updateForm({ motivation: e.target.value }); clearFieldError('motivation') }}
                required
              />
              {fieldErrors.motivation && (
                <p className="text-xs text-error flex items-center gap-1 mt-1" role="alert">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {fieldErrors.motivation}
                </p>
              )}
            </div>
            <div>
              <label className="label-md uppercase tracking-widest text-secondary block mb-2">Portfolio URL (optional)</label>
              <input
                className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 text-on-surface"
                type="url"
                value={form.portfolio_url}
                onChange={(e) => updateForm({ portfolio_url: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div>
              <label className="label-md uppercase tracking-widest text-secondary block mb-2">LinkedIn (optional)</label>
              <input
                className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 text-on-surface"
                type="url"
                value={form.linkedin_url}
                onChange={(e) => updateForm({ linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
              <div>
                <label className="label-md uppercase tracking-widest text-secondary block mb-2">
                  Profile Photo <span className="text-primary-fixed ml-0.5" aria-hidden="true">*</span>
                </label>
                <p className="text-xs text-on-surface-variant mb-2">JPEG or PNG · max 5 MB</p>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        updateForm({ profile_photo: file, profilePhotoPreview: URL.createObjectURL(file) })
                        clearFieldError('profile_photo')
                      }
                    }}
                    className="block w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-fixed/15 file:text-primary-fixed file:font-bold file:uppercase file:text-[10px]"
                  />
                  {form.profilePhotoPreview && (
                    <img src={form.profilePhotoPreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-outline-variant/30" />
                  )}
                  {fieldErrors.profile_photo && (
                    <p className="text-xs text-error flex items-center gap-1" role="alert">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.profile_photo}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="label-md uppercase tracking-widest text-secondary block mb-2">
                  CV / Resume <span className="text-primary-fixed ml-0.5" aria-hidden="true">*</span>
                </label>
                <p className="text-xs text-on-surface-variant mb-2">PDF or Word · max 10 MB</p>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        updateForm({ cv: file, cvName: file.name })
                        clearFieldError('cv')
                      }
                    }}
                    className="block w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-fixed/15 file:text-primary-fixed file:font-bold file:uppercase file:text-[10px]"
                  />
                  {form.cvName && (
                    <span className="text-[10px] text-primary-fixed font-medium italic">Selected: {form.cvName}</span>
                  )}
                  {fieldErrors.cv && (
                    <p className="text-xs text-error flex items-center gap-1" role="alert">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.cv}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Availability */}
        {step === 4 && (
          <div className="space-y-6" data-aos="fade-up">
            <h2 className="headline-sm text-primary-fixed mb-2">Availability</h2>
            <p className="body-md text-on-surface-variant">Which days can you generally support before and during the festival?</p>
            <div className="flex flex-wrap gap-3">
              {AVAILABILITY_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-full label-md font-bold uppercase tracking-wider transition-all ${
                    form.availability?.days?.includes(day)
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'bg-surface-container-low border border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6" data-aos="fade-up">
            <h2 className="headline-sm text-primary-fixed mb-2">Review & submit</h2>
            <div className="space-y-4 body-md text-on-surface-variant">
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <p className="label-md text-secondary uppercase tracking-widest mb-2">Pathways</p>
                <p className="text-on-surface">
                  {selectedPathways.length > 0
                    ? selectedPathways.map((p) => p.name).join(', ')
                    : '—'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <p className="label-md text-secondary uppercase tracking-widest mb-2">Location</p>
                <p className="text-on-surface">
                  {[form.city, form.country].filter(Boolean).join(', ')}
                  {form.phone ? ` · ${form.phone}` : ''}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <p className="label-md text-secondary uppercase tracking-widest mb-2">Experience</p>
                <p className="text-on-surface">{form.experience_years} years</p>
                <p className="mt-2 text-sm">{form.skills_summary}</p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <p className="label-md text-secondary uppercase tracking-widest mb-2">Available days</p>
                <p className="text-on-surface">{(form.availability?.days || []).join(', ')}</p>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.code_of_conduct_accepted}
                onChange={(e) => updateForm({ code_of_conduct_accepted: e.target.checked })}
                required
              />
              <span className="body-md text-on-surface-variant">
                I agree to uphold Islamic adab and the Code of Conduct.
              </span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4 mt-10 pt-6 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={goBack}
            className={`btn-secondary flex items-center gap-2 ${step === 1 ? 'invisible' : ''}`}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>
          {step < 5 ? (
            <button type="button" onClick={goNext} className="btn-primary flex items-center gap-2 px-8 py-3 rounded-full">
              {step === 4 ? 'Review application' : 'Continue'}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-8 py-3 rounded-full font-bold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit application'}
            </button>
          )}
        </div>
      </form>
    </main>
  )
}
