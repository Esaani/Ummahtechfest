import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ApiError, registrationsApi } from '../api/client'
import HoneypotField from '../components/HoneypotField'
import PassRegistrationGate, { SelectedPassBanner } from '../components/PassRegistrationGate.jsx'
import { FormField, FormInput, FormSelect } from '../components/forms/FormField'
import {
  EXPERIENCE_YEAR_OPTIONS,
  JOB_ROLE_OPTIONS,
  OTHER_JOB_ROLE_VALUE,
} from '../config/registrationOptions'

export default function ProfessionalDetails() {
  return (
    <PassRegistrationGate expectedFlow="open">
      {(pass) => <ProfessionalDetailsForm pass={pass} />}
    </PassRegistrationGate>
  )
}

function ProfessionalDetailsForm({ pass }) {
  const navigate = useNavigate()
  const [roleChoice, setRoleChoice] = useState('')
  const [roleOther, setRoleOther] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [organization, setOrganization] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const validate = () => {
    const err = {}
    if (!roleChoice) err.role = 'Select your role.'
    else if (roleChoice === OTHER_JOB_ROLE_VALUE && roleOther.trim().length < 2) {
      err.roleOther = 'Enter your role (at least 2 characters).'
    }
    if (experienceYears === '') err.experienceYears = 'Select years of experience.'
    if (organization.trim().length < 2) err.organization = 'Enter your company or institution.'
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const job_title = roleChoice === OTHER_JOB_ROLE_VALUE ? roleOther.trim() : roleChoice
    setError('')
    setSubmitting(true)
    try {
      const res = await registrationsApi.submitOpen({
        pass_type: pass.id,
        job_title,
        experience_years: Number(experienceYears) || 0,
        organization: organization.trim(),
        website: honeypot,
      })
      navigate('/registration/confirmation', {
        state: { status: res.data?.status || 'pending_payment', passId: pass.id },
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to submit registration. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body kente-pattern">
      <div className="flex max-w-container-max mx-auto pt-24 min-h-screen">
        <aside className="hidden lg:flex flex-col p-6 gap-4 h-[calc(100vh-6rem)] sticky top-24 bg-surface-container-low/60 backdrop-blur-md border-r border-outline-variant/30 w-80">
          <div className="mb-8">
            <h2 className="headline-sm text-primary-fixed">Registration</h2>
            <p className="body-md text-on-surface-variant">Ghana 2026 Edition</p>
          </div>
          <nav className="space-y-2">
            <Link to="/signup" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-bright/20 rounded-lg">
              <span className="material-symbols-outlined">confirmation_number</span>
              <span className="label-md">Pass Selection</span>
            </Link>
            <div className="flex items-center gap-3 p-3 bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/20 rounded-lg font-bold">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="label-md">Details</span>
            </div>
            <div className="flex items-center gap-3 p-3 text-on-surface-variant/40 opacity-50">
              <span className="material-symbols-outlined">payments</span>
              <span className="label-md">Payment (after submit)</span>
            </div>
          </nav>
        </aside>

        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-12">
          <SelectedPassBanner pass={pass} />
          <header className="mb-12" data-aos="fade-up">
            <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded label-md font-bold uppercase tracking-wider">
              Step 2
            </span>
            <h1 className="headline-lg text-primary mt-4 mb-2">Professional Details</h1>
            <p className="body-lg text-on-surface-variant max-w-2xl">
              Tell us about your role so we can tailor your summit experience. Use the lists below to keep your
              registration consistent.
            </p>
          </header>

          <section className="glass-card p-8 rounded-xl kente-border">
            {error && (
              <p className="mb-6 p-3 rounded-lg bg-error/10 body-md" role="alert">
                {error}
              </p>
            )}
            <form className="space-y-8 relative" onSubmit={handleSubmit}>
              <HoneypotField value={honeypot} onChange={setHoneypot} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="md:col-span-2">
                  <FormField label="Role / title" htmlFor="role_select" required error={fieldErrors.role}>
                    <FormSelect
                      id="role_select"
                      value={roleChoice}
                      onChange={(e) => {
                        setRoleChoice(e.target.value)
                        setFieldErrors((f) => ({ ...f, role: '' }))
                      }}
                      hasError={!!fieldErrors.role}
                      required
                    >
                      {JOB_ROLE_OPTIONS.map((o) => (
                        <option key={o.value || 'placeholder'} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </FormSelect>
                  </FormField>
                </div>
                {roleChoice === OTHER_JOB_ROLE_VALUE && (
                  <div className="md:col-span-2">
                    <FormField label="Describe your role" htmlFor="role_other" required error={fieldErrors.roleOther}>
                      <FormInput
                        id="role_other"
                        value={roleOther}
                        onChange={(e) => {
                          setRoleOther(e.target.value)
                          setFieldErrors((f) => ({ ...f, roleOther: '' }))
                        }}
                        placeholder="e.g. Chief Data Officer"
                        hasError={!!fieldErrors.roleOther}
                      />
                    </FormField>
                  </div>
                )}
                <div>
                  <FormField label="Years of experience" htmlFor="experience" required error={fieldErrors.experienceYears}>
                    <FormSelect
                      id="experience"
                      value={experienceYears}
                      onChange={(e) => {
                        setExperienceYears(e.target.value)
                        setFieldErrors((f) => ({ ...f, experienceYears: '' }))
                      }}
                      hasError={!!fieldErrors.experienceYears}
                      required
                    >
                      {EXPERIENCE_YEAR_OPTIONS.map((o) => (
                        <option key={o.value || 'ex-ph'} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </FormSelect>
                  </FormField>
                </div>
                <div className="md:col-span-2">
                  <FormField label="Company / organization" htmlFor="org" hint="Legal or commonly known name." required error={fieldErrors.organization}>
                    <FormInput
                      id="org"
                      value={organization}
                      onChange={(e) => {
                        setOrganization(e.target.value)
                        setFieldErrors((f) => ({ ...f, organization: '' }))
                      }}
                      placeholder="Where do you work or study?"
                      hasError={!!fieldErrors.organization}
                    />
                  </FormField>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-outline-variant/30">
                <Link to={`/create-account?pass=${pass.id}`} className="flex items-center gap-2 label-md text-on-surface-variant hover:text-primary-fixed">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </Link>
                <button
                  className="w-full md:w-auto bg-primary-fixed text-on-primary-fixed px-12 py-4 rounded-lg label-md font-bold uppercase tracking-widest disabled:opacity-60"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Complete registration'}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  )
}
