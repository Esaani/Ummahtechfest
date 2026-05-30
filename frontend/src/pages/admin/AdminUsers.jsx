import { useCallback, useEffect, useState } from 'react'
import { ApiError, authApi } from '../../api/client'
import AdminFormSelect from '../../components/admin/AdminFormSelect.jsx'
import { ADMIN_ROLES } from '../../config/adminPermissions'
import { useAuth } from '../../context/AuthContext'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium' })
}

export default function AdminUsers() {
  const { isSuperAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('submissions_reviewer')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    authApi
      .adminUsers(false)
      .then((res) => setUsers(res.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load team'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviteSuccess('')
    setError('')
    setInviting(true)
    try {
      await authApi.inviteAdminUser({ email: inviteEmail.trim(), admin_role: inviteRole })
      setInviteEmail('')
      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}.`)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invite failed')
    } finally {
      setInviting(false)
    }
  }

  const updateUser = async (id, payload) => {
    setUpdatingId(id)
    setError('')
    try {
      const res = await authApi.updateAdminUser(id, payload)
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Team & roles</h1>
      <p className="body-md text-on-surface-variant mb-8 max-w-2xl">
        Invite staff and assign roles. Each role controls which admin tabs and APIs they can use.
      </p>

      <div className="glass-panel p-6 rounded-2xl mb-10 max-w-xl">
        <h2 className="headline-sm text-primary mb-4">Invite team member</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="label-md text-on-surface-variant block mb-1">Email</label>
            <input
              id="invite-email"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 body-md"
            />
          </div>
          <AdminFormSelect
            label="Role"
            htmlFor="invite-role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={ADMIN_ROLES}
          />
          <button
            type="submit"
            disabled={inviting}
            className="btn-primary px-6 py-3 rounded-full label-md font-bold disabled:opacity-60"
          >
            {inviting ? 'Sending…' : 'Send invite'}
          </button>
        </form>
        {inviteSuccess && <p className="mt-4 body-md text-primary-fixed">{inviteSuccess}</p>}
      </div>

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

      {loading ? (
        <p className="body-md text-on-surface-variant">Loading…</p>
      ) : users.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center">
          <p className="body-md text-on-surface-variant">No staff accounts yet. Send an invite above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-outline-variant/30 label-md text-on-surface-variant uppercase text-[10px]">
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Active</th>
                <th className="py-3 pr-4">Joined</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id} className="border-b border-outline-variant/20 body-md">
                  <td className="py-4 pr-4">
                    <div className="font-medium">{row.email}</div>
                    {row.full_name && row.full_name !== row.email && (
                      <div className="text-sm text-on-surface-variant">{row.full_name}</div>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    {row.is_superuser ? (
                      <span className="label-md text-primary-fixed">Superadmin</span>
                    ) : (
                      <select
                        className="bg-surface-container border border-outline-variant/40 rounded-lg px-2 py-1 text-xs max-w-[200px]"
                        value={row.admin_role || ''}
                        disabled={updatingId === row.id || row.is_superuser}
                        onChange={(e) => updateUser(row.id, { admin_role: e.target.value || null })}
                      >
                        <option value="">— No role —</option>
                        {ADMIN_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <input
                      type="checkbox"
                      checked={row.is_active}
                      disabled={updatingId === row.id || row.is_superuser}
                      onChange={(e) => updateUser(row.id, { is_active: e.target.checked })}
                    />
                  </td>
                  <td className="py-4 pr-4 text-sm text-on-surface-variant">{formatDate(row.created_at)}</td>
                  <td className="py-4 text-sm text-on-surface-variant">
                    {(row.admin_permissions || []).join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
