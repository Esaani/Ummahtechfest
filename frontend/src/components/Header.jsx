import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavPageLink from './NavPageLink.jsx'
import logo from '../assets/logo.png'

function initialsForUser(user) {
  const first = (user?.first_name || '').trim()
  const last = (user?.last_name || '').trim()
  if (first || last) {
    return `${(first[0] || '').toUpperCase()}${(last[0] || '').toUpperCase()}` || 'U'
  }
  const email = (user?.email || '').trim()
  if (email) return email[0].toUpperCase()
  return 'U'
}

function ProfileMenu({ onNavigate }) {
  const { isAuthenticated, user, logout, isAdminUser } = useAuth()
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const panelRef = useRef(null)

  const displayName = useMemo(() => {
    const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()
    return name || user?.email || 'Account'
  }, [user])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e) => {
      const t = e.target
      if (panelRef.current?.contains(t)) return
      if (btnRef.current?.contains(t)) return
      setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  if (!isAuthenticated) return null

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hidden xl:inline-flex items-center gap-3 rounded-full border border-outline-variant/40 bg-surface-container/40 hover:bg-surface-container/70 px-2 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        aria-label="Account menu"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-fixed/15 text-primary-fixed font-black text-xs">
          {initialsForUser(user)}
        </span>
        <span className="hidden 2xl:block text-[10px] font-black uppercase tracking-widest text-on-surface-variant max-w-[160px] truncate">
          {displayName}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant text-xl">expand_more</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Account"
          className="hidden xl:block absolute right-0 mt-3 w-[280px] rounded-2xl border border-outline-variant/30 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-outline-variant/20">
            <p className="label-md text-primary font-bold truncate">{displayName}</p>
            {user?.email && <p className="text-xs text-on-surface-variant truncate mt-1">{user.email}</p>}
          </div>
          <div className="p-2">
            <Link
              role="menuitem"
              to="/registration/status"
              onClick={() => { setOpen(false); onNavigate?.() }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-container-low text-sm text-on-surface"
            >
              <span className="material-symbols-outlined text-lg text-primary-fixed">confirmation_number</span>
              Registration status
            </Link>
            <Link
              role="menuitem"
              to="/volunteer/status"
              onClick={() => { setOpen(false); onNavigate?.() }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-container-low text-sm text-on-surface"
            >
              <span className="material-symbols-outlined text-lg text-primary-fixed">volunteer_activism</span>
              Volunteer status
            </Link>
            {isAdminUser && (
              <Link
                role="menuitem"
                to="/admin"
                onClick={() => { setOpen(false); onNavigate?.() }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-container-low text-sm text-on-surface"
              >
                <span className="material-symbols-outlined text-lg text-secondary">space_dashboard</span>
                CMS
              </Link>
            )}
          </div>
          <div className="p-2 border-t border-outline-variant/20">
            <button
              role="menuitem"
              type="button"
              onClick={() => { setOpen(false); logout(); onNavigate?.() }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-error/10 text-sm text-error"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DesktopAuthActions({ onNavigate }) {
  const { isAuthenticated, user, logout, isAdminUser } = useAuth()

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2 2xl:gap-3 shrink-0">
        <ProfileMenu onNavigate={onNavigate} />
        {/* Keep a compact logout on smaller desktops if needed */}
        <button
          type="button"
          onClick={() => { logout(); onNavigate?.() }}
          className="xl:hidden inline-flex items-center text-on-surface-variant hover:text-primary-fixed px-2 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
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
        Get your pass
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
                Get your pass
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
              <Link to="/registration/status" onClick={closeMenu} className="w-full py-4 border border-outline-variant/30 rounded-2xl flex items-center justify-center text-sm font-bold text-on-surface">
                Registration status
              </Link>
              <Link to="/volunteer/status" onClick={closeMenu} className="w-full py-4 border border-outline-variant/30 rounded-2xl flex items-center justify-center text-sm font-bold text-on-surface">
                Volunteer status
              </Link>
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
