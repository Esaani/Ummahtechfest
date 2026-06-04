import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import HoneypotField from '../components/HoneypotField'
import logo from '../assets/logo.png'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password, honeypot)
      const to = location.state?.from || '/'
      navigate(to)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[#050505] text-[#e5e2e1] min-h-screen flex items-center justify-center p-4 py-8 md:p-6 font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/images/umma-volunteer.webp" 
            alt="Ummah Tech Fest community" 
            className="w-full h-full object-cover opacity-20 grayscale mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-transparent to-[#050505] opacity-90"></div>
        </div>
        <div className="absolute inset-0 kente-pattern opacity-5"></div>
        <div className="absolute inset-0 kente-tech-pattern opacity-20"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-fixed/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary-gold/5 rounded-full blur-[120px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-4xl" data-aos="zoom-in">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] min-h-[550px] rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          
          {/* Left Column: Branding */}
          <section className="bg-surface-container-lowest p-4 py-6 md:p-8 flex flex-col items-center justify-between relative border-b md:border-b-0 md:border-r border-outline-variant/10 overflow-hidden">
            <div className="absolute inset-0 kente-tech-pattern opacity-10 pointer-events-none"></div>
            {/* Logo Section */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 md:w-32 md:h-32 mb-2 md:mb-8 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-primary-fixed/5 rounded-full animate-pulse"></div>
                <img src={logo} alt="Ummah Tech Fest" className="w-full h-auto object-contain relative z-10" />
              </div>
              <p className="hidden md:block body-md text-base text-on-surface-variant/80 max-w-xs leading-relaxed mb-8">
                Where Africa's innovators, investors, and leaders connect. Sign in to access your Ummah Tech Fest Ghana account and join the summit.
              </p>
              
              {/* Back to Home Button */}
              <Link to="/" className="flex items-center gap-2 md:gap-3 px-6 py-2 md:px-8 md:py-3 border border-outline-variant/50 rounded-xl label-md font-bold text-on-surface hover:bg-surface-bright/10 transition-all group">
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-sm md:text-base">arrow_back</span>
                <span className="text-sm md:text-base">Back to Home</span>
              </Link>
            </div>

            {/* Pagination Dots (Decoration) */}
            <div className="hidden md:flex gap-3 mt-12">
              <div className="w-3 h-3 rounded-full bg-primary-fixed"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant/30"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant/30"></div>
            </div>
          </section>

          {/* Right Column: Login Form */}
          <section className="bg-surface-container/80 backdrop-blur-2xl p-6 md:p-12 flex flex-col justify-center relative">
            {/* Subtle glow behind the form */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary-fixed/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <header className="mb-10 text-center md:text-left">
                <h1 className="headline-md text-primary mb-3">
                  {location.state?.from?.startsWith('/volunteer') ? 'Sign in to volunteer' : "Let's get you signed in"}
                </h1>
                <p className="body-md text-on-surface-variant leading-relaxed">
                  {location.state?.from?.startsWith('/volunteer')
                    ? 'Use your account to continue your volunteer application.'
                    : 'Enter your registration email & password to access your pass.'}
                </p>
              </header>

              {error && <p className="mb-4 p-3 rounded-lg bg-error/10 text-on-surface body-md" role="alert">{error}</p>}

              <form className="space-y-6 relative" onSubmit={handleSubmit}>
                <HoneypotField value={honeypot} onChange={setHoneypot} />
                {/* Email Field */}
                <div className="group">
                  <label className="block label-md text-on-surface-variant mb-2 group-focus-within:text-primary-fixed transition-colors uppercase tracking-widest" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-fixed transition-colors">mail</span>
                    <input 
                      className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-6 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-fixed/50 focus:border-primary-fixed transition-all font-body-md" 
                      id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" type="email" required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="label-md text-on-surface-variant group-focus-within:text-primary-fixed transition-colors uppercase tracking-widest" htmlFor="password">Password</label>
                    <Link className="label-md text-primary-fixed font-bold hover:underline transition-all" to="/forgot-password">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-fixed transition-colors">lock</span>
                    <input 
                      className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-16 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-fixed/50 focus:border-primary-fixed transition-all font-body-md" 
                      id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" type={showPassword ? "text" : "password"} required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary-fixed transition-colors focus:outline-none flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-bright/20"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Keep Me Logged In */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative w-5 h-5">
                    <input 
                      className="peer w-5 h-5 border-2 border-outline-variant/50 bg-surface-container-low rounded checked:bg-primary-fixed checked:border-primary-fixed cursor-pointer appearance-none transition-all hover:border-primary-fixed/50" 
                      id="keep-logged" 
                      type="checkbox"
                    />
                    <span className="material-symbols-outlined absolute inset-0 text-on-primary-fixed text-[14px] flex items-center justify-center opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
                  </div>
                  <label className="label-md text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors" htmlFor="keep-logged">Keep me logged in</label>
                </div>

                {/* Sign In Button */}
                <button className="w-full bg-primary-fixed text-on-primary-fixed mt-4 py-4 rounded-xl label-md font-bold shadow-[0_0_30px_rgba(163,250,1,0.15)] hover:shadow-[0_0_50px_rgba(163,250,1,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest border border-primary-fixed/50 relative overflow-hidden group" type="submit" disabled={submitting}>
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </form>

              <footer className="mt-12 text-center space-y-6 border-t border-outline-variant/20 pt-8">
                <p className="body-md text-on-surface-variant">
                  Don't have an account yet? 
                  <Link className="text-primary-fixed font-bold hover:underline ml-2" to="/volunteer/apply">Apply to volunteer</Link>
                </p>
                <p className="label-md text-on-surface-variant/40 uppercase tracking-[0.2em] text-[10px]">
                  &copy; 2026 Ummah Tech Fest Ghana.<br className="md:hidden"/> All rights reserved.
                </p>
              </footer>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
