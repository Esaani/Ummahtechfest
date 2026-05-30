import { Link } from 'react-router-dom'
import { GATED_STEPS } from '../config/passes'

/**
 * Shown instead of mock verification / payment when those steps are not wired.
 */
export default function RegistrationStepGate({ stepKey }) {
  const step = GATED_STEPS[stepKey]
  if (!step) return null

  return (
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/15 border border-secondary/30 mb-8">
        <span className="material-symbols-outlined text-secondary text-4xl">{step.icon}</span>
      </div>
      <h1 className="headline-lg text-primary mb-4">{step.title} — coming soon</h1>
      <p className="body-lg text-on-surface-variant mb-10">{step.message}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/registration/status" className="btn-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest">
          View my registration
        </Link>
        <Link to="/signup" className="btn-secondary px-8 py-3 rounded-full font-bold uppercase tracking-widest">
          Back to passes
        </Link>
      </div>
    </main>
  )
}
