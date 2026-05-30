import { Link, useLocation } from 'react-router-dom'
import { getPass } from '../config/passes'

const STATUS_COPY = {
  pending_payment: {
    icon: 'hourglass_top',
    title: 'Registration received',
    body: 'Your pass registration is saved. Online payment is coming soon — we will email you when you can complete payment.',
    cta: 'View registration status',
  },
  submitted: {
    icon: 'mark_email_read',
    title: 'Application submitted',
    body: 'Our team will review your credentials and notify you by email. You can check status anytime from your account.',
    cta: 'View application status',
  },
}

export default function RegistrationConfirmation() {
  const { state } = useLocation()
  const status = state?.status || 'pending_payment'
  const pass = state?.passId ? getPass(state.passId) : null
  const copy = STATUS_COPY[status] || STATUS_COPY.pending_payment

  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center kente-pattern">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 mb-8">
        <span className="material-symbols-outlined text-primary-fixed text-4xl">{copy.icon}</span>
      </div>
      <h1 className="headline-lg text-primary mb-4">{copy.title}</h1>
      {pass && (
        <p className="label-md text-secondary-fixed uppercase tracking-widest mb-4">{pass.title}</p>
      )}
      <p className="body-lg text-on-surface-variant mb-10">{copy.body}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/registration/status"
          className="btn-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest"
        >
          {copy.cta}
        </Link>
        <Link
          to="/signup"
          className="btn-secondary px-8 py-3 rounded-full font-bold uppercase tracking-widest"
        >
          Back to passes
        </Link>
      </div>
    </main>
  )
}
