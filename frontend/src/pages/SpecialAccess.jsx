import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ApiError, registrationsApi } from '../api/client'
import HoneypotField from '../components/HoneypotField'
import PassRegistrationGate, { SelectedPassBanner } from '../components/PassRegistrationGate.jsx'
import { FormField, FormInput, FormSelect } from '../components/forms/FormField'
import { JOB_ROLE_OPTIONS, OTHER_JOB_ROLE_VALUE } from '../config/registrationOptions'

export default function SpecialAccess() {
  return (
    <PassRegistrationGate expectedFlow="approval">
      {(pass) => <SpecialAccessForm pass={pass} />}
    </PassRegistrationGate>
  )
}

function SpecialAccessForm({ pass }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    organization_name: '',
    organization_website: '',
    contribution_statement: '',
  })
  const [roleChoice, setRoleChoice] = useState('')
  const [roleOther, setRoleOther] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const validate = () => {
    const err = {}
    if (form.organization_name.trim().length < 2) err.organization_name = 'Enter the organization name.'
    if (!roleChoice) err.role = 'Select your role.'
    else if (roleChoice === OTHER_JOB_ROLE_VALUE && roleOther.trim().length < 2) {
      err.roleOther = 'Enter your title (at least 2 characters).'
    }
    if (form.contribution_statement.trim().length < 20) {
      err.contribution_statement = 'Please share at least a short statement (20+ characters).'
    }
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
      const res = await registrationsApi.submitSpecialAccess({
        pass_type: pass.id,
        organization_name: form.organization_name.trim(),
        job_title,
        organization_website: form.organization_website || '',
        contribution_statement: form.contribution_statement.trim(),
        website: honeypot,
      })
      navigate('/registration/confirmation', {
        state: { status: res.data?.status || 'submitted', passId: pass.id },
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body kente-pattern">
      <main className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen flex flex-col lg:flex-row gap-12">
        <aside className="h-fit w-full lg:w-72 lg:sticky lg:top-32 hidden lg:block">
          <div className="glass-card p-6 rounded-xl border border-outline-variant/30">
            <h2 className="headline-sm text-primary-fixed">Registration</h2>
            <p className="body-md text-on-surface-variant mb-6">Ghana 2026 Edition</p>
            <Link to="/signup" className="label-md text-secondary-fixed hover:underline">
              Change pass
            </Link>
          </div>
        </aside>

        <div className="flex-1 space-y-10">
          <SelectedPassBanner pass={pass} />
          <header data-aos="fade-up">
            <h1 className="headline-lg text-primary mb-4">{pass.title} application</h1>
            <p className="body-lg text-on-surface-variant max-w-2xl">
              {pass.desc}
            </p>
          </header>

          {error && (
            <p className="p-3 rounded-lg bg-error/10 body-md" role="alert">
              {error}
            </p>
          )}

          <form className="space-y-10 relative" onSubmit={handleSubmit}>
            <HoneypotField value={honeypot} onChange={setHoneypot} />
            <div className="glass-card p-8 rounded-2xl border-l-4 border-l-primary-fixed">
              <h3 className="headline-sm text-white mb-8">Institutional background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <FormField label="Organization name" htmlFor="organization_name" required error={fieldErrors.organization_name}>
                    <FormInput
                      id="organization_name"
                      value={form.organization_name}
                      onChange={(e) => {
                        setForm({ ...form, organization_name: e.target.value })
                        setFieldErrors((f) => ({ ...f, organization_name: '' }))
                      }}
                      placeholder="e.g. Ministry of Communications"
                      hasError={!!fieldErrors.organization_name}
                    />
                  </FormField>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <FormField label="Your role / title" htmlFor="role_select" required error={fieldErrors.role}>
                    <FormSelect
                      id="role_select"
                      value={roleChoice}
                      onChange={(e) => {
                        setRoleChoice(e.target.value)
                        setFieldErrors((f) => ({ ...f, role: '' }))
                      }}
                      hasError={!!fieldErrors.role}
                    >
                      {JOB_ROLE_OPTIONS.map((o) => (
                        <option key={o.value || 'r'} value={o.value}>{o.label}</option>
                      ))}
                    </FormSelect>
                  </FormField>
                  {roleChoice === OTHER_JOB_ROLE_VALUE && (
                    <div className="mt-4">
                      <FormField label="Specify title" htmlFor="role_other" required error={fieldErrors.roleOther}>
                        <FormInput
                          id="role_other"
                          value={roleOther}
                          onChange={(e) => {
                            setRoleOther(e.target.value)
                            setFieldErrors((f) => ({ ...f, roleOther: '' }))
                          }}
                          hasError={!!fieldErrors.roleOther}
                        />
                      </FormField>
                    </div>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="label-md text-secondary uppercase tracking-wider block">Official website (optional)</label>
                  <input
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 text-on-surface outline-none focus:border-primary-fixed"
                    placeholder="https://organization.gov.gh"
                    type="url"
                    value={form.organization_website}
                    onChange={(e) => setForm({ ...form, organization_website: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border-l-4 border-l-primary-fixed">
              <h3 className="headline-sm text-white mb-8">Contribution & impact</h3>
              <FormField label="How will you contribute to the ecosystem?" htmlFor="contribution" required error={fieldErrors.contribution_statement}>
                <textarea
                  id="contribution"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-4 px-4 text-on-surface outline-none focus:border-primary-fixed resize-none min-h-[120px]"
                  rows={5}
                  value={form.contribution_statement}
                  onChange={(e) => {
                    setForm({ ...form, contribution_statement: e.target.value })
                    setFieldErrors((f) => ({ ...f, contribution_statement: '' }))
                  }}
                />
              </FormField>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-secondary/30 bg-secondary/5">
              <div className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-secondary">info</span>
                <div>
                  <p className="label-md font-bold text-secondary mb-1">Document upload — coming soon</p>
                  <p className="body-md text-on-surface-variant text-sm">
                    You can submit your application now. We may request ID or institutional proof by email during review.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-fixed text-on-primary-fixed px-16 py-5 rounded-lg headline-sm font-bold uppercase tracking-widest disabled:opacity-60 flex items-center gap-4"
              >
                {submitting ? 'Submitting…' : 'Submit application'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
