import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Success() {
  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed font-body kente-pattern flex items-center justify-center p-6">
      <main className="max-w-3xl w-full" data-aos="zoom-in">
        <div className="glass-card p-8 md:p-12 rounded-3xl kente-border text-center relative overflow-hidden">
          {/* Animated Background Element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-fixed/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-gold/10 rounded-full blur-3xl"></div>

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img src={logo} alt="Ummah Tech Fest" className="h-16 w-auto object-contain" />
          </div>

          {/* Success Icon */}
          <div className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-fixed/20 border-2 border-primary-fixed relative">
            <span className="material-symbols-outlined text-primary-fixed text-5xl">verified</span>
            <div className="absolute inset-0 rounded-full animate-ping bg-primary-fixed/20"></div>
          </div>

          {/* Content */}
          <h1 className="headline-md text-primary mb-6 leading-tight">
            You're One Step Closer <br />
            <span className="text-primary-fixed">to the Stage.</span>
          </h1>
          
          <p className="body-lg text-on-surface-variant mb-10 max-w-xl mx-auto leading-relaxed">
            Your application for the Ummah Tech Fest Ghana has been successfully received. We're excited to review your submission and explore how your expertise can inspire our community.
          </p>

          {/* Email Confirmation Status */}
          <div className="glass-card bg-surface-bright/5 p-6 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-center gap-6 mb-12 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary">mail</span>
            </div>
            <div className="text-left">
              <p className="label-md font-bold text-on-surface uppercase tracking-widest">Confirmation Sent</p>
              <p className="body-md text-on-surface-variant text-sm">A confirmation email has been sent to your registered address with your application ID.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link 
              to="/" 
              className="w-full md:w-auto bg-primary-fixed text-on-primary-fixed px-10 py-4 rounded-lg label-md font-bold hover:shadow-[0_0_30px_rgba(163,250,1,0.4)] transition-all uppercase tracking-widest"
            >
              Back to Home
            </Link>
            <Link 
              to="/schedule" 
              className="w-full md:w-auto border-2 border-outline-variant/50 text-on-surface px-10 py-4 rounded-lg label-md font-bold hover:bg-surface-bright/10 transition-all uppercase tracking-widest"
            >
              View Schedule
            </Link>
          </div>
        </div>

        <p className="mt-12 text-center label-md text-on-surface-variant/40 uppercase tracking-[0.3em]">
          Innovating with Ihsaan &bull; Ghana 2026
        </p>
      </main>
    </div>
  )
}
