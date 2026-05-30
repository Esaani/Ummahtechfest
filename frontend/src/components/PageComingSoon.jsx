import { Link } from 'react-router-dom'

export default function PageComingSoon({ page }) {
  if (!page) return null

  const links = page.relatedLinks || [
    { to: '/', label: 'Back to home' },
    { to: '/signup', label: 'Register' },
  ]

  return (
    <main className="min-h-screen bg-background text-on-background font-body kente-pattern pt-28 pb-24 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/40 bg-secondary/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="label-md text-secondary uppercase tracking-widest text-[10px] md:text-xs">Coming soon</span>
        </div>

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-fixed/10 border border-primary-fixed/25 mb-8">
          <span className="material-symbols-outlined text-primary-fixed text-4xl">{page.icon || 'hourglass_top'}</span>
        </div>

        <h1 className="headline-xl text-primary mb-4 uppercase tracking-tight">{page.headline || page.title}</h1>
        <p className="body-lg text-on-surface-variant mb-12 max-w-lg mx-auto">{page.message}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={link.primary !== false && links.indexOf(link) === 0
                ? 'btn-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest'
                : 'btn-secondary px-8 py-3 rounded-full font-bold uppercase tracking-widest'}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="glass-card p-6 rounded-2xl border border-outline-variant/30 text-left max-w-md mx-auto">
          <p className="label-md text-primary-fixed uppercase tracking-widest mb-3">Available now</p>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="body-md text-on-surface-variant hover:text-primary-fixed transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/sponsor" className="body-md text-on-surface-variant hover:text-primary-fixed transition-colors">
                Sponsor the fest
              </Link>
            </li>
            <li>
              <Link to="/volunteer" className="body-md text-on-surface-variant hover:text-primary-fixed transition-colors">
                Volunteer program
              </Link>
            </li>
            <li>
              <Link to="/apply-to-speak" className="body-md text-on-surface-variant hover:text-primary-fixed transition-colors">
                Apply to speak
              </Link>
            </li>
            <li>
              <Link to="/signup" className="body-md text-on-surface-variant hover:text-primary-fixed transition-colors">
                Pass registration
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
