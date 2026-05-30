import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

/**
 * Shared layout for login, forgot password, and reset password (no site header/footer).
 */
export default function AuthPageShell({ title, subtitle, children, footer }) {
  return (
    <div className="bg-[#050505] text-[#e5e2e1] min-h-screen flex items-center justify-center p-4 py-8 md:p-6 font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-20 grayscale mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-transparent to-[#050505] opacity-90" />
        </div>
        <div className="absolute inset-0 kente-pattern opacity-5" />
        <div className="absolute inset-0 kente-tech-pattern opacity-20" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-fixed/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary-gold/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-4xl" data-aos="zoom-in">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] min-h-[520px] rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          <section className="bg-surface-container-lowest p-6 md:p-8 flex flex-col items-center justify-between relative border-b md:border-b-0 md:border-r border-outline-variant/10 overflow-hidden">
            <div className="absolute inset-0 kente-tech-pattern opacity-10 pointer-events-none" />
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 md:w-28 md:h-28 mb-6 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-primary-fixed/5 rounded-full animate-pulse" />
                <img src={logo} alt="Ummah Tech Fest" className="w-full h-auto object-contain relative z-10" />
              </div>
              <p className="hidden md:block body-md text-on-surface-variant/80 max-w-xs leading-relaxed mb-8">
                Secure access to your Ummah Tech Fest Ghana account — passes, volunteer applications, and more.
              </p>
              <Link
                to="/"
                className="flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 border border-outline-variant/50 rounded-xl label-md font-bold text-on-surface hover:bg-surface-bright/10 transition-all group"
              >
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-sm">arrow_back</span>
                Back to home
              </Link>
            </div>
          </section>

          <section className="bg-surface-container/80 backdrop-blur-2xl p-6 md:p-10 flex flex-col justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary-fixed/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <header className="mb-8 text-center md:text-left">
                <h1 className="headline-md text-primary mb-2">{title}</h1>
                {subtitle && <p className="body-md text-on-surface-variant leading-relaxed">{subtitle}</p>}
              </header>
              {children}
              {footer && <footer className="mt-10 pt-6 border-t border-outline-variant/20">{footer}</footer>}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
