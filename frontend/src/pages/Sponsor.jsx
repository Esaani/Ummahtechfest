import { useEffect, useMemo, useState } from 'react'
import { ApiError, cmsApi, outreachApi } from '../api/client'
import HoneypotField from '../components/HoneypotField'
import SkeletonImage from '../components/SkeletonImage'
import ChoiceCards from '../components/forms/ChoiceCards'
import { FormField, FormInput, FormTextarea } from '../components/forms/FormField'
import { validateSponsorInquiry } from '../utils/formValidation'
import { cmsMediaUrl } from '../utils/mediaUrl'

const FALLBACK_TIERS = [
  { value: 'diamond', label: 'Diamond Sponsor', description: 'Premier visibility · main stage & branding' },
  { value: 'gold', label: 'Gold Sponsor', description: 'Strong presence · keynote & premium booth' },
  { value: 'silver', label: 'Silver Sponsor', description: 'Solid exposure · standard booth package' },
  { value: 'custom', label: 'Custom Sponsorship', description: 'Tailored package — tell us your goals' },
]

const FALLBACK_COLUMNS = [
  { slug: 'silver', name: 'Silver', price_display: '₵5,000', highlight_column: false },
  { slug: 'gold', name: 'Gold', price_display: '₵15,000', highlight_column: true },
  { slug: 'diamond', name: 'Diamond', price_display: '₵35,000', highlight_column: false },
]

const FALLBACK_ROWS = [
  { label: 'Exhibition Booth Size', values: { silver: '3×3m Standard', gold: '6×3m Premium', diamond: '9×6m Custom Island' } },
  { label: 'Speaking Slot', values: { silver: '✕', gold: '15 Min Keynote', diamond: '30 Min + Panel' } },
  { label: 'Logo Placement', values: { silver: 'Marketing Assets', gold: 'Premium Assets', diamond: 'Primary Branding' } },
  { label: 'VIP Tickets', values: { silver: '2', gold: '5', diamond: '15' } },
  { label: 'Talent Access', values: { silver: '✕', gold: '✔', diamond: '✔' } },
]

const WHY_SPONSOR = [
  { icon: 'groups', title: 'Reach decision-makers', text: 'Connect with CTOs, founders, and policymakers across West Africa.' },
  { icon: 'campaign', title: 'Brand visibility', text: 'Showcase your company across event media and our tech community channels.' },
  { icon: 'school', title: 'Talent pipeline', text: 'Meet developers and engineers aligned with modern, ethical product stacks.' },
]

const NEXT_STEPS = [
  'We review your goals and tier interest within one business day.',
  'A partnerships lead schedules a short call or email follow-up.',
  'We send a tailored sponsorship proposal for Ghana 2026.',
]

export default function Sponsor() {
  const [tiers, setTiers] = useState(FALLBACK_TIERS)
  const [columns, setColumns] = useState(FALLBACK_COLUMNS)
  const [tableRows, setTableRows] = useState(FALLBACK_ROWS)
  const [heroImage, setHeroImage] = useState(null)
  const [heroStat, setHeroStat] = useState({ value: '5,000+', label: 'Targeted Tech Professionals' })
  const [cmsLoading, setCmsLoading] = useState(true)
  const [form, setForm] = useState({
    full_name: '',
    company_name: '',
    email: '',
    tier_interest: 'gold',
    requirements: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  useEffect(() => {
    cmsApi
      .publicSponsorship()
      .then((res) => {
        const data = res.data || {}
        if (data.inquiry_tiers?.length) {
          setTiers(
            data.inquiry_tiers.map((t) => ({
              value: t.value,
              label: t.label,
              description: t.description || '',
            })),
          )
          if (!data.inquiry_tiers.some((t) => t.value === form.tier_interest)) {
            setForm((f) => ({ ...f, tier_interest: data.inquiry_tiers[0].value }))
          }
        }
        if (data.comparison_columns?.length) setColumns(data.comparison_columns)
        if (data.comparison_rows?.length) setTableRows(data.comparison_rows)
        if (data.hero) {
          setHeroImage(cmsMediaUrl(data.hero.hero_image_url, ''))
          setHeroStat({
            value: data.hero.stat_value || '5,000+',
            label: data.hero.stat_label || 'Targeted Tech Professionals',
          })
        }
      })
      .catch(() => {
        outreachApi
          .options()
          .then((res) => {
            if (res.data?.sponsor_tiers?.length) {
              setTiers(
                res.data.sponsor_tiers.map((t) => ({
                  ...t,
                  description: FALLBACK_TIERS.find((f) => f.value === t.value)?.description || '',
                })),
              )
            }
          })
          .catch(() => {})
      })
      .finally(() => setCmsLoading(false))
  }, [])

  const selectedTier = useMemo(
    () => tiers.find((t) => t.value === form.tier_interest) || tiers[0],
    [tiers, form.tier_interest],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateSponsorInquiry(form)
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    setError('')
    setSubmitting(true)
    try {
      await outreachApi.submitSponsorInquiry({ ...form, website: honeypot })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send inquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="pt-24 md:pt-32 pb-20">
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-16 md:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left" data-aos="fade-right">
            <span className="label-md text-secondary tracking-widest uppercase mb-4 block text-[10px] md:text-xs">Sponsor with us</span>
            <h1 className="text-4xl md:headline-xl text-primary mb-6 uppercase leading-tight">
              Empower the Future of <span className="text-primary-fixed">Muslim Tech.</span>
            </h1>
            <p className="text-sm md:body-lg text-on-surface-variant mb-8 max-w-xl mx-auto lg:mx-0">
              Join us in Accra for West Africa&apos;s most influential gathering of Muslim technologists, innovators, and entrepreneurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a className="btn-primary w-full sm:w-auto text-center" href="#inquiry">Sponsor inquiry</a>
              <a className="btn-secondary w-full sm:w-auto text-center" href="#tiers">View tiers</a>
            </div>
          </div>
          <div className="relative hidden lg:block" data-aos="fade-left">
            <div className="aspect-square rounded-2xl overflow-hidden kente-border">
              <SkeletonImage
                src={heroImage || undefined}
                alt=""
                className="w-full h-full"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 glass-panel p-6 rounded-xl border-l-4 border-primary-fixed max-w-xs shadow-2xl">
              <p className="headline-sm text-primary-fixed mb-1">{heroStat.value}</p>
              <p className="label-md text-on-surface uppercase text-[10px] tracking-widest font-black">{heroStat.label}</p>
            </div>
          </div>
        </div>
      </section>

      {submitted && (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-12">
          <div className="glass-panel p-8 rounded-2xl border border-primary-fixed/30 text-center">
            <span className="material-symbols-outlined text-primary-fixed text-5xl mb-4">check_circle</span>
            <h2 className="headline-sm text-primary mb-2">Inquiry received</h2>
            <p className="body-md text-on-surface-variant">Our sponsorship team will contact you within 24 hours.</p>
          </div>
        </section>
      )}

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-24" id="tiers">
        <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:headline-lg text-primary mb-4 uppercase">
            Sponsorship <span className="text-primary-fixed">Tiers</span>
          </h2>
          <div className="h-1 w-24 bg-primary-fixed mx-auto" />
        </div>
        {cmsLoading ? (
          <p className="text-center body-md text-on-surface-variant">Loading tiers…</p>
        ) : (
          <div className="overflow-x-auto no-scrollbar pb-8" data-aos="fade-up">
            <table className="w-full border-collapse glass-panel rounded-2xl overflow-hidden min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-high text-left">
                  <th className="p-8 headline-sm text-primary">Benefits</th>
                  {columns.map((col) => (
                    <th
                      key={col.slug}
                      className={`p-8 text-center border-x border-outline-variant/30 ${
                        col.highlight_column ? 'bg-primary-fixed/5' : ''
                      }`}
                    >
                      <div className={`headline-sm uppercase ${col.highlight_column ? 'text-primary-fixed' : 'text-secondary'}`}>
                        {col.name}
                      </div>
                      {col.price_display && (
                        <div className="label-md text-on-surface-variant font-normal mt-2">{col.price_display}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-on-surface">
                {tableRows.map((row) => (
                  <tr key={row.key || row.label} className="border-t border-outline-variant/20 hover:bg-white/5 transition-colors">
                    <td className="p-6 label-md text-primary font-bold uppercase">{row.label}</td>
                    {columns.map((col) => (
                      <td
                        key={col.slug}
                        className={`p-6 text-center border-x border-outline-variant/20 text-sm md:text-base ${
                          col.highlight_column ? 'bg-primary-fixed/5 font-bold text-primary-fixed' : ''
                        }`}
                      >
                        {row.values?.[col.slug] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {WHY_SPONSOR.map((item, i) => (
            <div
              key={item.title}
              className="glass-panel p-10 rounded-2xl relative overflow-hidden group hover:border-primary-fixed transition-all duration-500"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <span className="material-symbols-outlined text-primary-fixed text-3xl mb-4">{item.icon}</span>
              <h3 className="headline-sm text-primary mb-4 uppercase font-bold">{item.title}</h3>
              <p className="text-sm md:body-md text-on-surface-variant relative z-10">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop" id="inquiry">
        <div className="glass-panel rounded-3xl overflow-hidden border border-outline-variant/30 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-10 lg:p-12 bg-surface-container-high/50 lg:border-r border-outline-variant/20 flex flex-col gap-8">
              <div>
                <h2 className="text-2xl md:headline-md text-primary mb-4 uppercase font-bold">
                  Sponsor <span className="text-primary-fixed">Inquiry</span>
                </h2>
                <p className="text-sm md:body-md text-on-surface-variant">
                  Tell us about your company and sponsorship goals. Our team will follow up within 24 hours at the email you provide.
                </p>
              </div>

              <ul className="space-y-5">
                {WHY_SPONSOR.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="material-symbols-outlined text-primary-fixed shrink-0">{item.icon}</span>
                    <div>
                      <p className="label-md text-primary font-bold uppercase text-xs tracking-wider">{item.title}</p>
                      <p className="text-sm text-on-surface-variant mt-1">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="glass-panel rounded-xl p-5 border border-primary-fixed/20">
                <p className="label-md text-on-surface-variant uppercase text-[10px] tracking-widest mb-2">Selected tier</p>
                <p className="headline-sm text-primary-fixed">{selectedTier?.label}</p>
                {selectedTier?.description && (
                  <p className="text-sm text-on-surface-variant mt-2">{selectedTier.description}</p>
                )}
              </div>

              <div>
                <p className="label-md text-primary font-bold uppercase text-xs tracking-wider mb-3">What happens next</p>
                <ol className="space-y-2 list-decimal list-inside text-sm text-on-surface-variant">
                  {NEXT_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="p-8 md:p-10 lg:p-12">
              {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}
              <form className="space-y-6 relative" onSubmit={handleSubmit}>
                <HoneypotField value={honeypot} onChange={setHoneypot} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="Full name" htmlFor="full_name" required error={fieldErrors.full_name}>
                    <FormInput
                      id="full_name"
                      autoComplete="name"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      hasError={!!fieldErrors.full_name}
                    />
                  </FormField>
                  <FormField label="Company" htmlFor="company_name" required error={fieldErrors.company_name}>
                    <FormInput
                      id="company_name"
                      autoComplete="organization"
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      hasError={!!fieldErrors.company_name}
                    />
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField label="Work email" htmlFor="email" required error={fieldErrors.email}>
                      <FormInput
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        hasError={!!fieldErrors.email}
                      />
                    </FormField>
                  </div>
                </div>
                <FormField label="Sponsorship level" required>
                  <ChoiceCards
                    name="Sponsorship level"
                    value={form.tier_interest}
                    onChange={(v) => setForm({ ...form, tier_interest: v })}
                    options={tiers}
                    columns={2}
                  />
                </FormField>
                <FormField label="Message" htmlFor="requirements" hint="Optional — booth needs, speaking interest, timeline, etc.">
                  <FormTextarea
                    id="requirements"
                    rows={3}
                    placeholder="Share anything helpful for our sponsorship team…"
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  />
                </FormField>
                <button
                  type="submit"
                  disabled={submitting || submitted}
                  className="w-full btn-primary py-4 rounded-xl disabled:opacity-60"
                >
                  {submitting ? 'Sending…' : submitted ? 'Sent' : 'Send request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
