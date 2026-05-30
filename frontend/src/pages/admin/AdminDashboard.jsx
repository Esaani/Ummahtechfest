import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ADMIN_DASHBOARD_CARDS, filterByPermission } from '../../config/adminPermissions'

export default function AdminDashboard() {
  const { user } = useAuth()
  const cards = filterByPermission(ADMIN_DASHBOARD_CARDS, user)

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Admin dashboard</h1>
      <p className="body-md text-on-surface-variant mb-4 max-w-2xl">
        Signed in as <strong>{user?.email}</strong>
        {user?.admin_role_label ? ` · ${user.admin_role_label}` : ''}.
      </p>
      <p className="body-md text-on-surface-variant mb-10 max-w-2xl">
        Open a section below. You only see areas your role is allowed to access.
      </p>
      {cards.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center">
          <p className="body-md text-on-surface-variant">No sections assigned to your role yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="glass-card p-8 rounded-2xl border border-outline-variant/30 hover:border-primary-fixed/40 transition-all"
            >
              <span className="material-symbols-outlined text-4xl text-primary-fixed mb-4">{card.icon}</span>
              <h2 className="headline-sm text-primary mb-2">{card.title}</h2>
              <p className="body-md text-on-surface-variant text-sm">{card.text}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
