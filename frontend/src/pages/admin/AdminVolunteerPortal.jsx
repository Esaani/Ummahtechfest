import { useCallback, useEffect, useState } from 'react'
import { ApiError, volunteerApi } from '../../api/client'

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { id: 'announcements', label: 'Announcements', icon: 'campaign' },
]

const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const STATUS_COLORS = {
  pending:     'text-on-surface-variant border-outline-variant/40',
  in_progress: 'text-primary border-primary/40',
  done:        'text-primary-fixed border-primary-fixed/40',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

// ── Task Form ─────────────────────────────────────────────────────────────────

function TaskForm({ volunteers, roles, initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    due_label: initial?.due_label || '',
    status: initial?.status || 'pending',
    assign_to: 'volunteer',
    application_id: '',
    target_role_id: '',
  })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description,
      due_label: form.due_label,
      status: form.status,
    }
    if (!initial) {
      if (form.assign_to === 'volunteer') payload.application_id = form.application_id
      else payload.target_role_id = form.target_role_id
    }
    onSave(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-md text-on-surface-variant block mb-1">Title *</label>
        <input
          required
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="form-control w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm bg-surface-container"
          placeholder="e.g. Set up registration desk"
        />
      </div>
      <div>
        <label className="label-md text-on-surface-variant block mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="form-control w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm bg-surface-container"
          placeholder="Additional details for the volunteer…"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-md text-on-surface-variant block mb-1">Due (display label)</label>
          <input
            value={form.due_label}
            onChange={(e) => set('due_label', e.target.value)}
            className="form-control w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm bg-surface-container"
            placeholder="e.g. Day 1, 08:00 AM"
          />
        </div>
        <div>
          <label className="label-md text-on-surface-variant block mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="form-select w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm bg-surface-container"
          >
            {TASK_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!initial && (
        <div className="space-y-3 p-4 rounded-xl border border-outline-variant/30 bg-surface-container/40">
          <p className="label-md text-on-surface-variant font-semibold">Assign to</p>
          <div className="flex gap-4">
            {['volunteer', 'role'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="assign_to"
                  value={opt}
                  checked={form.assign_to === opt}
                  onChange={() => set('assign_to', opt)}
                  className="accent-primary"
                />
                <span className="body-md text-sm">{opt === 'volunteer' ? 'Specific volunteer' : 'Entire role'}</span>
              </label>
            ))}
          </div>
          {form.assign_to === 'volunteer' ? (
            <div>
              <label className="label-md text-on-surface-variant block mb-1">Volunteer *</label>
              <select
                required
                value={form.application_id}
                onChange={(e) => set('application_id', e.target.value)}
                className="form-select w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm bg-surface-container"
              >
                <option value="">Select a volunteer…</option>
                {volunteers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.assigned_role ? `(${v.assigned_role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="label-md text-on-surface-variant block mb-1">Role *</label>
              <select
                required
                value={form.target_role_id}
                onChange={(e) => set('target_role_id', e.target.value)}
                className="form-select w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm bg-surface-container"
              >
                <option value="">Select a role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary px-6 py-2 rounded-lg label-md font-bold disabled:opacity-60">
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg label-md border border-outline-variant/40 hover:bg-surface-bright/20">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Announcement Form ─────────────────────────────────────────────────────────

function AnnouncementForm({ roles, initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    body: initial?.body || '',
    target_role_id: '',
    is_published: initial?.is_published ?? true,
  })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      title: form.title,
      body: form.body,
      target_role_id: form.target_role_id || null,
      is_published: form.is_published,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-md text-on-surface-variant block mb-1">Title *</label>
        <input
          required
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="form-control w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm bg-surface-container"
          placeholder="e.g. Briefing location update"
        />
      </div>
      <div>
        <label className="label-md text-on-surface-variant block mb-1">Message *</label>
        <textarea
          required
          value={form.body}
          onChange={(e) => set('body', e.target.value)}
          rows={5}
          className="form-control w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm bg-surface-container"
          placeholder="Announcement details…"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-md text-on-surface-variant block mb-1">Target audience</label>
          <select
            value={form.target_role_id}
            onChange={(e) => set('target_role_id', e.target.value)}
            className="form-select w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm bg-surface-container"
          >
            <option value="">All accepted volunteers</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name} only</option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => set('is_published', e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <span className="body-md text-sm">Published (visible to volunteers)</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary px-6 py-2 rounded-lg label-md font-bold disabled:opacity-60">
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Post announcement'}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg label-md border border-outline-variant/40 hover:bg-surface-bright/20">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminVolunteerPortal() {
  const [tab, setTab] = useState('tasks')
  const [tasks, setTasks] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editingAnn, setEditingAnn] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Load meta (volunteers + roles) once
  useEffect(() => {
    Promise.all([
      volunteerApi.adminAcceptedVolunteers().then((r) => setVolunteers(r.data || [])).catch(() => {}),
      volunteerApi.adminRoles().then((r) => setRoles(r.data || [])).catch(() => {}),
    ])
  }, [])

  const loadTasks = useCallback(() => {
    setLoading(true)
    setError('')
    volunteerApi
      .adminTasks()
      .then((r) => setTasks(r.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load tasks.'))
      .finally(() => setLoading(false))
  }, [])

  const loadAnnouncements = useCallback(() => {
    setLoading(true)
    setError('')
    volunteerApi
      .adminAnnouncements()
      .then((r) => setAnnouncements(r.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load announcements.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'tasks') loadTasks()
    else loadAnnouncements()
  }, [tab, loadTasks, loadAnnouncements])

  // ── Task actions ──────────────────────────────────────────────────────────

  const handleSaveTask = async (payload) => {
    setSaving(true)
    setError('')
    try {
      if (editingTask) {
        const res = await volunteerApi.updateAdminTask(editingTask.id, payload)
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.data : t)))
      } else {
        const res = await volunteerApi.createAdminTask(payload)
        setTasks((prev) => [res.data, ...prev])
      }
      setShowTaskForm(false)
      setEditingTask(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save task.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task? Volunteers will no longer see it.')) return
    setDeletingId(id)
    try {
      await volunteerApi.deleteAdminTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete task.')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Announcement actions ──────────────────────────────────────────────────

  const handleSaveAnn = async (payload) => {
    setSaving(true)
    setError('')
    try {
      if (editingAnn) {
        const res = await volunteerApi.updateAdminAnnouncement(editingAnn.id, payload)
        setAnnouncements((prev) => prev.map((a) => (a.id === editingAnn.id ? res.data : a)))
      } else {
        const res = await volunteerApi.createAdminAnnouncement(payload)
        setAnnouncements((prev) => [res.data, ...prev])
      }
      setShowAnnForm(false)
      setEditingAnn(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save announcement.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAnn = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    setDeletingId(id)
    try {
      await volunteerApi.deleteAdminAnnouncement(id)
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete announcement.')
    } finally {
      setDeletingId(null)
    }
  }

  const openNewTask = () => { setEditingTask(null); setShowTaskForm(true) }
  const openEditTask = (t) => { setEditingTask(t); setShowTaskForm(true) }
  const cancelTask = () => { setShowTaskForm(false); setEditingTask(null) }

  const openNewAnn = () => { setEditingAnn(null); setShowAnnForm(true) }
  const openEditAnn = (a) => { setEditingAnn(a); setShowAnnForm(true) }
  const cancelAnn = () => { setShowAnnForm(false); setEditingAnn(null) }

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Volunteer Portal</h1>
      <p className="body-md text-on-surface-variant mb-8 max-w-2xl">
        Assign tasks and post announcements to accepted volunteers.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg label-md transition-colors ${
              tab === t.id
                ? 'bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30 font-bold'
                : 'text-on-surface-variant border border-outline-variant/30 hover:bg-surface-bright/20'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-6 p-3 rounded-lg bg-error/10 body-md text-error" role="alert">{error}</p>
      )}

      {/* ── Tasks ── */}
      {tab === 'tasks' && (
        <div>
          {showTaskForm ? (
            <div className="glass-card p-6 rounded-2xl border border-outline-variant/30 mb-8 max-w-2xl">
              <h2 className="headline-sm text-primary mb-4">{editingTask ? 'Edit task' : 'New task'}</h2>
              <TaskForm
                volunteers={volunteers}
                roles={roles}
                initial={editingTask}
                onSave={handleSaveTask}
                onCancel={cancelTask}
                saving={saving}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={openNewTask}
              className="mb-8 flex items-center gap-2 px-5 py-2.5 rounded-lg btn-primary label-md font-bold"
            >
              <span className="material-symbols-outlined">add</span>
              New task
            </button>
          )}

          {loading ? (
            <p className="body-md text-on-surface-variant">Loading…</p>
          ) : tasks.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center">
              <p className="body-md text-on-surface-variant">No tasks yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="glass-card p-5 rounded-2xl border border-outline-variant/30 flex items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <p className="font-semibold body-md text-on-surface">{task.title}</p>
                      <span className={`text-xs border px-2 py-0.5 rounded-full label-md ${STATUS_COLORS[task.status] || ''}`}>
                        {TASK_STATUS_OPTIONS.find((o) => o.value === task.status)?.label || task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="body-md text-on-surface-variant text-sm mb-1">{task.description}</p>
                    )}
                    <div className="flex gap-4 text-xs text-on-surface-variant flex-wrap">
                      {task.volunteer_name && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">person</span>
                          {task.volunteer_name}
                        </span>
                      )}
                      {task.target_role_name && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">group</span>
                          {task.target_role_name} (role-wide)
                        </span>
                      )}
                      {task.due_label && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {task.due_label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditTask(task)}
                      className="p-1.5 rounded-lg hover:bg-surface-bright/20 text-on-surface-variant"
                      aria-label="Edit task"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={deletingId === task.id}
                      className="p-1.5 rounded-lg hover:bg-error/10 text-error/70 disabled:opacity-50"
                      aria-label="Delete task"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Announcements ── */}
      {tab === 'announcements' && (
        <div>
          {showAnnForm ? (
            <div className="glass-card p-6 rounded-2xl border border-outline-variant/30 mb-8 max-w-2xl">
              <h2 className="headline-sm text-primary mb-4">{editingAnn ? 'Edit announcement' : 'New announcement'}</h2>
              <AnnouncementForm
                roles={roles}
                initial={editingAnn}
                onSave={handleSaveAnn}
                onCancel={cancelAnn}
                saving={saving}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={openNewAnn}
              className="mb-8 flex items-center gap-2 px-5 py-2.5 rounded-lg btn-primary label-md font-bold"
            >
              <span className="material-symbols-outlined">add</span>
              New announcement
            </button>
          )}

          {loading ? (
            <p className="body-md text-on-surface-variant">Loading…</p>
          ) : announcements.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center">
              <p className="body-md text-on-surface-variant">No announcements yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="glass-card p-6 rounded-2xl border border-outline-variant/30">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="font-semibold body-md text-on-surface">{ann.title}</h3>
                        {ann.target_role_name ? (
                          <span className="text-xs border border-primary/30 text-primary px-2 py-0.5 rounded-full">
                            {ann.target_role_name}
                          </span>
                        ) : (
                          <span className="text-xs border border-outline-variant/40 text-on-surface-variant px-2 py-0.5 rounded-full">
                            All volunteers
                          </span>
                        )}
                        {!ann.is_published && (
                          <span className="text-xs border border-error/40 text-error px-2 py-0.5 rounded-full">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="body-md text-on-surface-variant text-sm whitespace-pre-wrap">{ann.body}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">{formatDate(ann.created_at)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditAnn(ann)}
                        className="p-1.5 rounded-lg hover:bg-surface-bright/20 text-on-surface-variant"
                        aria-label="Edit announcement"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnn(ann.id)}
                        disabled={deletingId === ann.id}
                        className="p-1.5 rounded-lg hover:bg-error/10 text-error/70 disabled:opacity-50"
                        aria-label="Delete announcement"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
