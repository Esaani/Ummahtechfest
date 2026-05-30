import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { volunteerApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const PATHWAYS = [
  { title: 'Event & Community Support', items: ['Workshop Assistants', 'Guest Relations & Registration', 'Event Logistics', 'Community Outreach'] },
  { title: 'Creative & Multimedia', items: ['Graphic Design', 'Motion Design', 'Videography', 'Photography', 'Video Editing', 'Social Media Content'] },
]

export default function Volunteer() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [hasApplication, setHasApplication] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setHasApplication(false)
      return
    }
    setChecking(true)
    volunteerApi
      .eligibility()
      .then((res) => setHasApplication(res.data?.has_application ?? false))
      .catch(() => setHasApplication(false))
      .finally(() => setChecking(false))
  }, [authLoading, isAuthenticated])

  const ctaHref = hasApplication ? '/volunteer/status' : '/volunteer/apply'
  const ctaLabel = hasApplication ? 'View application status' : 'Apply now'

  return (
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <header className="mb-16 text-center" data-aos="fade-up">
        <p className="label-md text-primary-fixed uppercase tracking-widest mb-4">Serve the Ummah</p>
        <h1 className="headline-lg text-primary mb-6">Volunteer Program</h1>
        <p className="body-lg text-on-surface-variant max-w-3xl mx-auto">
          Help deliver workshops, guest experiences, and the digital presence of Ummah Tech Fest Ghana 2026.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-8 mb-16">
        {PATHWAYS.map((p) => (
          <div key={p.title} className="glass-card p-8 rounded-2xl border border-outline-variant/30" data-aos="fade-up">
            <h2 className="headline-sm text-primary-fixed mb-4">{p.title}</h2>
            <ul className="space-y-2 body-md text-on-surface-variant">
              {p.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary-fixed">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="glass-card p-10 rounded-2xl text-center border border-primary-fixed/20" data-aos="zoom-in">
        <h2 className="headline-sm text-white mb-4">Ready to join?</h2>
        <p className="body-md text-on-surface-variant mb-8 max-w-xl mx-auto">
          {hasApplication
            ? 'You have already submitted your volunteer application. Track its status below.'
            : 'Each person may apply once. Submit your skills, availability, and preferred pathways — our team will review and follow up.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={authLoading || checking ? '/volunteer' : ctaHref}
            className="btn-primary inline-flex px-10 py-4 rounded-full label-md font-black uppercase tracking-widest"
          >
            {authLoading || checking ? 'Loading...' : ctaLabel}
          </Link>
          {!hasApplication && !checking && (
            <Link
              to="/signup"
              className="btn-secondary inline-flex px-8 py-4 rounded-full label-md font-black uppercase tracking-widest"
            >
              Get event pass
            </Link>
          )}
        </div>
        {!isAuthenticated && !authLoading && (
          <p className="body-md text-on-surface-variant mt-6 text-sm">
            You will sign in or create an account on the next step — no ticket purchase required to volunteer.
          </p>
        )}
      </section>
    </main>
  )
}
