import { useState } from 'react'
import { ApiError, paymentsApi } from '../api/client'
import HoneypotField from './HoneypotField'
import { FormField, FormInput } from './forms/FormField'

const PRESET_AMOUNTS = [50, 100, 200, 500]

export default function DonationWidget({ isModal = false }) {
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const resolveAmount = () => {
    if (selectedPreset != null) return selectedPreset
    const n = parseFloat(customAmount)
    return Number.isFinite(n) ? n : null
  }

  const validate = () => {
    const err = {}
    const amount = resolveAmount()
    if (!amount || amount < 1) err.amount = 'Choose or enter an amount (min 1 GHS).'
    if (amount > 50000) err.amount = 'Maximum donation is 50,000 GHS.'
    if (donorName.trim().length < 2) err.donorName = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) err.donorEmail = 'Enter a valid email.'
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setError('')
    setSubmitting(true)
    try {
      const res = await paymentsApi.donate({
        amount: String(resolveAmount()),
        donor_name: donorName.trim(),
        donor_email: donorEmail.trim(),
        message: message.trim(),
        website: honeypot,
      })
      const url = res.data?.authorization_url
      if (!url) {
        setError('Could not start checkout. Please try again.')
        return
      }
      window.location.href = url
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to process donation.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`w-full ${isModal ? '' : 'max-w-lg mx-auto lg:mx-0'} text-left`}>
      {!isModal && (
        <>
          <p className="label-md text-on-primary-fixed uppercase tracking-widest mb-2 font-black opacity-90">
            Support the cause
          </p>
          <h3 className="text-xl md:text-2xl font-headline text-on-primary-fixed uppercase mb-4">
            Donate to Ummah Tech Fest
          </h3>
          <p className="body-md text-on-primary-fixed-variant mb-8 opacity-90 text-sm">
            Help us bring Ghana 2026 to life — workshops, scholarships, and community programs.
          </p>
        </>
      )}

      {isModal && (
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-fixed/10 rounded-full border border-primary-fixed/20 mb-6 mx-auto sm:mx-0">
            <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse shadow-[0_0_10px_#A3FA01]" />
            <span className="text-[11px] font-black text-primary-fixed uppercase tracking-[0.2em]">Support the cause</span>
          </div>
          <h2 id="donation-modal-title" className="text-4xl md:text-5xl font-headline text-primary uppercase leading-[0.9] mb-6">
            Empower the <br /> <span className="text-primary-fixed italic font-black">Next Generation</span>
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg max-w-lg opacity-70 leading-relaxed font-medium">
            Your contribution directly funds Africa's largest gathering of Muslim tech talent. Every GHS builds the future.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <HoneypotField value={honeypot} onChange={setHoneypot} />
        {error && (
          <div className="p-5 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-4 animate-in slide-in-from-top-4" role="alert">
            <span className="material-symbols-outlined text-error text-2xl font-bold">warning</span>
            <p className="text-sm font-bold text-error uppercase tracking-tight">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="label-md text-on-surface-variant font-black uppercase tracking-[0.15em] text-[11px] opacity-60">Select Amount (GHS)</span>
            {selectedPreset && <span className="text-primary-fixed text-xs font-black animate-in fade-in zoom-in">Excellent choice!</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setSelectedPreset(amt)
                  setCustomAmount('')
                  setFieldErrors((f) => ({ ...f, amount: '' }))
                }}
                className={`group relative px-4 py-5 rounded-2xl label-md font-black transition-all duration-500 border-2 overflow-hidden ${
                  selectedPreset === amt
                    ? 'bg-primary-fixed border-primary-fixed text-on-primary-fixed shadow-[0_15px_30px_rgba(163,250,1,0.25)] scale-105'
                    : 'bg-surface-container-high/30 border-outline-variant/10 text-primary hover:border-primary-fixed/40 hover:bg-primary-fixed/5'
                }`}
              >
                <span className="relative z-10">{amt}</span>
                {selectedPreset === amt && (
                  <span className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                )}
              </button>
            ))}
          </div>
          {fieldErrors.amount && (
            <p className="text-[10px] font-black text-error uppercase tracking-widest pl-1" role="alert">{fieldErrors.amount}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField label="Custom amount" htmlFor="donate-custom" error={fieldErrors.amount ? '' : undefined}>
            <FormInput
              id="donate-custom"
              type="number"
              min="1"
              step="1"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedPreset(null)
                setFieldErrors((f) => ({ ...f, amount: '' }))
              }}
              className="!bg-surface-container-high/30 !border-outline-variant/10 !rounded-2xl !py-4 focus:!border-primary-fixed focus:!bg-surface-container-high/50 transition-all"
            />
          </FormField>

          <FormField label="Full Name" htmlFor="donate-name" required error={fieldErrors.donorName}>
            <FormInput
              id="donate-name"
              placeholder="Your Name"
              value={donorName}
              onChange={(e) => {
                setDonorName(e.target.value)
                setFieldErrors((f) => ({ ...f, donorName: '' }))
              }}
              className="!bg-surface-container-high/30 !border-outline-variant/10 !rounded-2xl !py-4 focus:!border-primary-fixed focus:!bg-surface-container-high/50 transition-all"
            />
          </FormField>
        </div>

        <FormField label="Email Address" htmlFor="donate-email" required error={fieldErrors.donorEmail}>
          <FormInput
            id="donate-email"
            type="email"
            placeholder="hello@example.com"
            value={donorEmail}
            onChange={(e) => {
              setDonorEmail(e.target.value)
              setFieldErrors((f) => ({ ...f, donorEmail: '' }))
            }}
            className="!bg-surface-container-high/30 !border-outline-variant/10 !rounded-2xl !py-4 focus:!border-primary-fixed focus:!bg-surface-container-high/50 transition-all"
          />
        </FormField>

        <div className="space-y-2">
          <span className="label-md text-on-surface-variant font-black uppercase tracking-[0.15em] text-[11px] opacity-60">Message (optional)</span>
          <textarea
            id="donate-message"
            placeholder="Share a word of encouragement..."
            className="w-full bg-surface-container-high/30 border border-outline-variant/10 rounded-2xl py-4 px-5 text-primary outline-none focus:border-primary-fixed focus:bg-surface-container-high/50 transition-all min-h-[120px] text-sm resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group relative w-full bg-primary-fixed text-on-primary-fixed py-6 rounded-[2rem] headline-sm font-black uppercase tracking-[0.2em] disabled:opacity-60 hover:shadow-[0_20px_40px_rgba(163,250,1,0.3)] hover:-translate-y-1.5 active:translate-y-0 transition-all duration-500 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            {submitting ? (
              <>
                <span className="w-6 h-6 rounded-full border-3 border-on-primary-fixed/20 border-t-on-primary-fixed animate-spin" />
                Processing
              </>
            ) : (
              <>
                Complete Donation
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_forward</span>
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </button>
      </form>
    </div>
  )
}
