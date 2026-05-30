import { Link } from 'react-router-dom'

/**
 * Shown on /volunteer/apply when the user is not signed in.
 * Keeps volunteer apply discoverable without dumping users on the generic login page.
 */
export default function VolunteerApplyGate() {
  return (
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-lg mx-auto">
      <Link to="/volunteer" className="label-md text-primary-fixed hover:underline">
        ← Volunteer Program
      </Link>

      <header className="mt-6 mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 mb-6">
          <span className="material-symbols-outlined text-primary-fixed text-3xl">volunteer_activism</span>
        </div>
        <h1 className="headline-lg text-primary mb-3">Apply to volunteer</h1>
        <p className="body-md text-on-surface-variant">
          Sign in or create a free account to start your volunteer application. This is separate from buying an event pass.
        </p>
      </header>

      <div className="glass-card p-8 rounded-2xl border border-outline-variant/30 space-y-4">
        <Link
          to="/login"
          state={{ from: '/volunteer/apply' }}
          className="btn-primary w-full py-4 rounded-xl font-bold uppercase tracking-widest text-center block"
        >
          Sign in to apply
        </Link>
        <Link
          to="/create-account"
          state={{ from: '/volunteer/apply' }}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-center block border-2 border-primary-fixed text-primary-fixed hover:bg-primary-fixed/10 transition-all"
        >
          Create account
        </Link>
        <p className="body-md text-on-surface-variant text-center text-sm pt-2">
          Already have an event pass? Use the same email — one account works for tickets and volunteering.
        </p>
      </div>

      <p className="body-md text-on-surface-variant text-center mt-8 text-sm">
        Want to attend as a delegate?{' '}
        <Link to="/signup" className="text-primary-fixed font-bold hover:underline">
          Choose your pass
        </Link>
      </p>
    </main>
  )
}
