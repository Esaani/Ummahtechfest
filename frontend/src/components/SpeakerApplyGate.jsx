import { Link } from 'react-router-dom'

/**
 * Shown when a speaker application requires a signed-in account.
 */
export default function SpeakerApplyGate({ onboarding = false }) {
  const returnPath = onboarding ? '/speaker/onboarding' : '/speaker/apply'

  return (
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-lg mx-auto">
      <Link to="/" className="label-md text-primary-fixed hover:underline">
        ← Home
      </Link>

      <header className="mt-6 mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 mb-6">
          <span className="material-symbols-outlined text-primary-fixed text-3xl">mic</span>
        </div>
        <h1 className="headline-lg text-primary mb-3">
          {onboarding ? 'Complete your speaker profile' : 'Register to apply'}
        </h1>
        <p className="body-md text-on-surface-variant">
          {onboarding
            ? 'Sign in to finish the onboarding form we sent after your invitation.'
            : 'Create a free account first so we can link your speaker application to your profile.'}
        </p>
      </header>

      <div className="glass-card p-8 rounded-2xl border border-outline-variant/30 space-y-4">
        <Link
          to="/login"
          state={{ from: returnPath }}
          className="btn-primary w-full py-4 rounded-xl font-bold uppercase tracking-widest text-center block"
        >
          Sign in
        </Link>
        <Link
          to="/create-account"
          state={{ from: returnPath }}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-center block border-2 border-primary-fixed text-primary-fixed hover:bg-primary-fixed/10 transition-all"
        >
          Register
        </Link>
      </div>

      <p className="body-md text-on-surface-variant text-center mt-8 text-sm">
        Volunteering instead?{' '}
        <Link to="/volunteer/apply" className="text-primary-fixed font-bold hover:underline">
          Apply to volunteer
        </Link>
      </p>
    </main>
  )
}
