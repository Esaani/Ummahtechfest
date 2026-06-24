import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError, authApi } from '../api/client'
import { userCanAccessAdminPortal, userHasAdminPermission } from '../config/adminPermissions'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const setTokens = (tokens) => {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
  }

  const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await authApi.me()
      setUser(res.data)
    } catch (err) {
      // ApiError means the server definitively rejected the request — clear the session.
      // A plain Error means a network failure — keep tokens so the next load can retry.
      if (err instanceof ApiError) clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('auth:session-expired', onExpired)
    return () => window.removeEventListener('auth:session-expired', onExpired)
  }, [])

  const login = async (email, password, website = '') => {
    const res = await authApi.login({ email, password, website })
    setTokens(res.tokens)
    setUser(res.data)
    return res.data
  }

  const register = async (payload) => {
    const res = await authApi.register({ website: '', ...payload })
    setTokens(res.tokens)
    setUser(res.data)
    return res.data
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      if (refresh) await authApi.logout(refresh)
    } catch {
      /* ignore */
    }
    clearTokens()
    setUser(null)
  }

  const hasAdminPermission = useCallback(
    (permission) => userHasAdminPermission(user, permission),
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isSuperAdmin: !!user?.is_superuser,
      isAdminUser: userCanAccessAdminPortal(user),
      hasAdminPermission,
    }),
    [user, loading, hasAdminPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
