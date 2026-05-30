import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavPageLink from './NavPageLink.jsx'
import logo from '../assets/logo.png'

function DesktopAuthActions({ onNavigate }) {
  const { isAuthenticated, user, logout, isAdminUser } = useAuth()

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2 2xl:gap-3 shrink-0">
        {isAdminUser && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className="hidden xl:inline-flex items-center text-secondary-fixed hover:text-primary-fixed px-2 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
          >
            CMS
          </Link>
        )}
        <span
          className="hidden 2xl:inline label-md text-on-surface-variant truncate max-w-[140px]"
          title={user?.email}
        >
          {user?.first_name || user?.email}
        </span>
        <button
          type="button"
          onClick={() => { logout(); onNavigate?.() }}
          className="hidden xl:inline-flex items-center text-on-surface-variant hover:text-primary-fixed px-2 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
        >
          Log out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link
        to="/login"
        onClick={onNavigate}
        className="hidden xl:inline-flex items-center text-on-surface-variant hover:text-primary-fixed px-2 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
      >
        Login
      </Link>
      <Link
        to="/signup"
        onClick={onNavigate}
        className="hidden xl:inline-flex items-center bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all whitespace-nowrap"
      >
        Register
      </Link>
    </div>
  )
}

const NAV_LINKS = [
  { to: '/', label: 'Home', match: (p) => p === '/' },
  { to: '/ghana-2026', label: 'Ghana 2026', gated: true, match: (p) => p === '/ghana-2026' },
  { to: '/schedule', label: 'Schedule', gated: true, match: (p) => p === '/schedule' },
  { to: '/tickets', label: 'Tickets', gated: true, match: (p) => p === '/tickets' },
  { to: '/volunteer', label: 'Volunteer', match: (p) => p.startsWith('/volunteer') },
  { to: '/sponsor', label: 'Sponsor', match: (p) => p === '/sponsor' },
]

export default function Header() {
  const { isAuthenticated, isAdminUser, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isFooterInView, setIsFooterInView] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      if (window.innerWidth < 1280) {
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
    document.body.style.overflow = nextState ? 'hidden' : ''
  }

  const closeMenu = () => setIsMenuOpen(false)

  const linkClass = (active) =>
    `nav-link text-[10px] 2xl:text-xs uppercase font-black tracking-widest whitespace-nowrap shrink-0 ${active ? 'nav-link-active' : ''}`

  return (
    <>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-200 ${isScrolled ? 'bg-background/95 backdrop-blur-xl py-0' : 'bg-transparent py-2'}`}>
        <nav className="grid grid-cols-[auto_1fr_auto] items-center w-full px-margin-mobile xl:px-margin-desktop h-16 xl:h-20 max-w-container-max mx-auto gap-3 xl:gap-6">
          <Link
            to="/"
            className={`flex items-center shrink-0 min-w-0 transition-all duration-200 ${isFooterInView ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <img src={logo} alt="Ummah Tech Fest" className="h-10 xl:h-12 w-auto object-contain" />
          </Link>

          <div className="hidden xl:flex items-center justify-center gap-5 2xl:gap-8 min-w-0 overflow-hidden">
            {NAV_LINKS.map((item) => {
              const active = item.match(location.pathname)
              const className = linkClass(active)
              if (item.gated) {
                return (
                  <NavPageLink key={item.to} to={item.to} className={className}>
                    {item.label}
                  </NavPageLink>
                )
              }
              return (
                <Link key={item.to} to={item.to} className={className}>
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0 min-w-0">
            <DesktopAuthActions onNavigate={closeMenu} />
            <button
              type="button"
              onClick={toggleMenu}
              className="xl:hidden w-10 h-10 flex items-center justify-center text-primary-fixed bg-surface-container/50 rounded-xl border border-outline-variant/30"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="material-symbols-outlined text-2xl">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>
      </header>

      <div className={`fixed inset-0 bg-background/98 backdrop-blur-3xl z-[110] flex flex-col items-center justify-center gap-6 transition-all duration-200 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="absolute top-0 left-0 w-full px-margin-mobile py-4 flex justify-between items-center border-b border-outline-variant/10">
          <img src={logo} alt="Ummah Tech Fest" className="h-10 w-auto object-contain" />
          <button type="button" onClick={toggleMenu} className="w-10 h-10 flex items-center justify-center text-primary-fixed bg-surface-container/50 rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {NAV_LINKS.map((item) => {
          const active = item.match(location.pathname)
          const className = `text-2xl font-black uppercase tracking-tighter transition-all duration-300 ${active ? 'text-primary-fixed scale-110' : 'text-primary hover:text-primary-fixed'}`
          if (item.gated) {
            return (
              <NavPageLink key={item.to} to={item.to} onClick={closeMenu} className={className}>
                {item.label}
              </NavPageLink>
            )
          }
          return (
            <Link key={item.to} to={item.to} onClick={closeMenu} className={className}>
              {item.label}
            </Link>
          )
        })}

        <div className="mt-8 w-full px-margin-mobile flex flex-col gap-4 max-w-sm">
          <Link to="/volunteer/apply" onClick={closeMenu} className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center text-sm uppercase tracking-widest font-black">
            Apply to volunteer
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to="/signup" onClick={closeMenu} className="w-full py-4 border-2 border-primary-fixed text-primary-fixed rounded-2xl flex items-center justify-center text-sm font-bold uppercase tracking-widest">
                Get event pass
              </Link>
              <Link to="/login" onClick={closeMenu} className="w-full py-4 border border-outline-variant/30 rounded-2xl flex items-center justify-center text-sm font-bold text-on-surface">
                Login
              </Link>
            </>
          ) : (
            <>
              {isAdminUser && (
                <Link to="/admin" onClick={closeMenu} className="w-full py-4 border border-outline-variant/30 rounded-2xl flex items-center justify-center text-sm font-bold text-secondary-fixed">
                  CMS Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => { logout(); closeMenu() }}
                className="w-full py-4 border border-outline-variant/30 rounded-2xl flex items-center justify-center text-sm font-bold text-on-surface"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
