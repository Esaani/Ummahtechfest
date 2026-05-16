import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isFooterInView, setIsFooterInView] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Only hide logo on mobile (below lg breakpoint)
      if (window.innerWidth < 1024) {
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400
        setIsFooterInView(atBottom)
      } else {
        setIsFooterInView(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    document.body.style.overflow = ''
    window.scrollTo(0, 0)
  }, [location])

  const toggleMenu = () => {
    const nextState = !isMenuOpen
    setIsMenuOpen(nextState)
    if (nextState) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-200 ${isScrolled ? 'bg-background/95 backdrop-blur-xl py-0' : 'bg-transparent py-2'}`}>
        <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 md:h-20 max-w-container-max mx-auto relative z-10">
          <Link to="/" className={`group flex items-center transition-all duration-200 ${isFooterInView ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
            <img src={logo} alt="Ummah Tech Fest" className="h-12 md:h-14 w-auto object-contain" />
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className={`nav-link text-xs uppercase font-black tracking-widest ${isActive('/') ? 'nav-link-active' : ''}`}>Home</Link>
            <Link to="/ghana-2026" className={`nav-link text-xs uppercase font-black tracking-widest ${isActive('/ghana-2026') ? 'nav-link-active' : ''}`}>Ghana 2026</Link>
            <Link to="/schedule" className={`nav-link text-xs uppercase font-black tracking-widest ${isActive('/schedule') ? 'nav-link-active' : ''}`}>Schedule</Link>
            <Link to="/tickets" className={`nav-link text-xs uppercase font-black tracking-widest ${isActive('/tickets') ? 'nav-link-active' : ''}`}>Tickets</Link>
            <Link to="/sponsor" className={`nav-link text-xs uppercase font-black tracking-widest ${isActive('/sponsor') ? 'nav-link-active' : ''}`}>Sponsor</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:flex items-center justify-center bg-primary-fixed text-on-primary-fixed px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest active:scale-95 transition-all duration-300 neon-glow hover:shadow-[0_0_20px_rgba(163,250,1,0.5)]">
              Login
            </Link>
            <Link to="/signup" className="hidden sm:flex items-center justify-center bg-primary-fixed text-on-primary-fixed px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest active:scale-95 transition-all duration-300 neon-glow hover:shadow-[0_0_20px_rgba(163,250,1,0.5)]">
              Register
            </Link>
            <button onClick={toggleMenu} className="lg:hidden w-10 h-10 flex items-center justify-center text-primary-fixed bg-surface-container/50 rounded-xl border border-outline-variant/30 active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-2xl">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-background/98 backdrop-blur-3xl z-[110] flex flex-col items-center justify-center gap-6 transition-all duration-200 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="absolute top-0 left-0 w-full px-margin-mobile py-4 flex justify-between items-center border-b border-outline-variant/10">
           <img src={logo} alt="Ummah Tech Fest" className="h-10 w-auto object-contain" />
           <button onClick={toggleMenu} className="w-10 h-10 flex items-center justify-center text-primary-fixed bg-surface-container/50 rounded-xl border border-outline-variant/30 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        
        <Link to="/" className={`text-2xl font-black uppercase tracking-tighter transition-all duration-300 ${isActive('/') ? 'text-primary-fixed scale-110' : 'text-primary hover:text-primary-fixed'}`}>Home</Link>
        <Link to="/ghana-2026" className={`text-2xl font-black uppercase tracking-tighter transition-all duration-300 ${isActive('/ghana-2026') ? 'text-primary-fixed scale-110' : 'text-primary hover:text-primary-fixed'}`}>Ghana 2026</Link>
        <Link to="/schedule" className={`text-2xl font-black uppercase tracking-tighter transition-all duration-300 ${isActive('/schedule') ? 'text-primary-fixed scale-110' : 'text-primary hover:text-primary-fixed'}`}>Schedule</Link>
        <Link to="/tickets" className={`text-2xl font-black uppercase tracking-tighter transition-all duration-300 ${isActive('/tickets') ? 'text-primary-fixed scale-110' : 'text-primary hover:text-primary-fixed'}`}>Tickets</Link>
        <Link to="/sponsor" className={`text-2xl font-black uppercase tracking-tighter transition-all duration-300 ${isActive('/sponsor') ? 'text-primary-fixed scale-110' : 'text-primary hover:text-primary-fixed'}`}>Sponsor</Link>
        
        <div className="mt-8 w-full px-margin-mobile flex flex-col gap-4">
          <Link to="/signup" className="w-full btn-primary py-5 rounded-2xl shadow-2xl flex items-center justify-center text-sm">REGISTER NOW</Link>
          <Link to="/login" className="w-full py-4 border border-outline-variant/30 rounded-2xl flex items-center justify-center text-sm font-bold text-on-surface hover:bg-surface-container/50 transition-all">LOGIN</Link>
        </div>

        <div className="absolute bottom-12 flex gap-6">
          <a href="#" className="text-on-surface-variant hover:text-primary-fixed transition-colors" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary-fixed transition-colors" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary-fixed transition-colors" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary-fixed transition-colors" aria-label="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </div>
    </>
  )
}
