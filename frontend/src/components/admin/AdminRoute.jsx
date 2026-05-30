import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
export default function AdminRoute({ permission, children }) {
  const { user, loading, hasAdminPermission } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="body-md text-on-surface-variant">Loading…</p>
  }

  if (permission && !hasAdminPermission(permission)) {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center max-w-lg">
        <span className="material-symbols-outlined text-5xl text-error mb-4">lock</span>
        <h2 className="headline-sm text-primary mb-2">Access denied</h2>
        <p className="body-md text-on-surface-variant mb-6">
          Your role ({user?.admin_role_label || 'staff'}) does not include access to this section.
        </p>
        <Link
          to="/admin"
          state={{ from: location.pathname }}
          className="btn-primary inline-block px-8 py-3 rounded-full"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  return children
}
