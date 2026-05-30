import { Link } from 'react-router-dom'
import { SIGNUP_BLOCKED } from '../utils/passHelpers'

export default function PassComingSoonModal({ pass, onClose }) {
  if (!pass) return null

  const isWaitlist = pass.signupBlockedReason === SIGNUP_BLOCKED.TICKETS_NOT_ON_SALE
  const title = pass.comingSoonTitle || (isWaitlist ? 'Tickets not on sale yet' : 'Coming soon')
  const message =
    pass.comingSoonMessage ||
    'This pass isn’t open for registration yet. Please choose another pass or check back later.'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-soon-title"
    >
      <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-outline-variant/30 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-5xl text-secondary mb-4">
            {isWaitlist ? 'confirmation_number' : pass.flow === 'volunteer' ? 'volunteer_activism' : 'schedule'}
          </span>
          <h2 id="pass-soon-title" className="headline-sm text-primary mb-2">
            {pass.title}
          </h2>
          <p className="label-md text-on-surface-variant mb-3">{title}</p>
          <p className="body-md text-on-surface-variant">{message}</p>
        </div>
        <div className="flex flex-col gap-3">
          {isWaitlist && (
            <Link
              to="/#tickets"
              onClick={onClose}
              className="btn-primary w-full py-3 rounded-xl text-center font-bold"
            >
              Join the waitlist
            </Link>
          )}
          <Link
            to="/signup"
            onClick={onClose}
            className={`w-full py-3 rounded-xl text-center font-bold ${
              isWaitlist ? 'border border-outline-variant/40 label-md' : 'btn-primary'
            }`}
          >
            See other passes
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-outline-variant/40 label-md text-on-surface-variant"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
