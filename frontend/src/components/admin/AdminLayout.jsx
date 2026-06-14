import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ADMIN_NAV, filterByPermission } from '../../config/adminPermissions'
import logo from '../../assets/logo.png'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navItems = filterByPermission(ADMIN_NAV, user)

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface-dim/95 backdrop-blur-md">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-3">
            <img src={logo} alt="" className="h-8 w-auto" />
            <span className="label-md text-primary-fixed font-bold uppercase tracking-widest hidden sm:inline">
              CMS Admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="label-md text-on-surface-variant hover:text-primary-fixed hidden md:inline">
              View site
            </Link>
            <span className="label-md text-on-surface-variant truncate max-w-[180px]" title={user?.email}>
              {user?.admin_role_label || user?.email}
            </span>
            <button type="button" onClick={logout} className="label-md text-secondary-fixed hover:underline">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 rounded-lg label-md whitespace-nowrap transition-colors ${
                    item.isSubItem ? 'pl-11 pr-4 text-[13px]' : 'px-4'
                  } ${
                    isActive
                      ? 'bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30 font-bold'
                      : 'text-on-surface-variant hover:bg-surface-bright/20'
                  }`
                }
              >
                <span className={`material-symbols-outlined ${item.isSubItem ? 'text-[18px]' : 'text-xl'}`}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
