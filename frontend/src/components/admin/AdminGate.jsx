import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AdminGate({ children }) {
  const { user, loading, isAuthenticated, isAdminUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname }, replace: true })
      return
    }
    if (!isAdminUser) {
      navigate('/', { replace: true })
    }
  }, [loading, isAuthenticated, isAdminUser, navigate, location.pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="body-md text-on-surface-variant">Loading admin…</p>
      </div>
    )
  }

  if (!isAuthenticated || !isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center">
          <span className="material-symbols-outlined text-5xl text-error mb-4">lock</span>
          <h1 className="headline-sm text-primary mb-2">Access denied</h1>
          <p className="body-md text-on-surface-variant mb-6">
            The admin portal is only available to invited staff with an assigned role.
          </p>
          <Link to="/" className="btn-primary inline-block px-8 py-3 rounded-full">
            Back to site
          </Link>
        </div>
      </div>
    )
  }

  return children({ user })
}
