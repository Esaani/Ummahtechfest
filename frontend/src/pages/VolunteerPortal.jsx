import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, volunteerApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const TABS = [
  { id: 'home',          label: 'Overview',      icon: 'space_dashboard' },
  { id: 'tasks',         label: 'Tasks',         icon: 'task_alt' },
  { id: 'announcements', label: 'Announcements', icon: 'campaign' },
]

const TASK_STATUS_META = {
  pending:     { label: 'Pending',     color: 'text-on-surface-variant border-outline-variant/40' },
  in_progress: { label: 'In Progress', color: 'text-primary border-primary/40' },
  done:        { label: 'Done',        color: 'text-primary-fixed border-primary-fixed/40' },
}

function TaskCard({ task, onToggle, toggling }) {
  const isDone = task.status === 'done'
  const meta = TASK_STATUS_META[task.status] || TASK_STATUS_META.pending

  return (
    <div className={`glass-card p-5 rounded-2xl border transition-all ${isDone ? 'border-primary-fixed/20 opacity-70' : 'border-outline-variant/30'}`}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onToggle(task.id, isDone ? 'pending' : 'done')}
          disabled={toggling === task.id}
          aria-label={isDone ? 'Mark as pending' : 'Mark as done'}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-50 ${
            isDone
              ? 'bg-primary-fixed border-primary-fixed text-on-primary-fixed'
              : 'border-outline-variant hover:border-primary-fixed'
          }`}
        >
          {isDone && <span className="material-symbols-outlined text-[14px]">check</span>}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`body-md font-semibold ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="body-md text-on-surface-variant text-sm mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {task.due_label && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {task.due_label}
              </span>
            )}
            <span className={`text-xs border px-2 py-0.5 rounded-full label-md ${meta.color}`}>
              {meta.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnnouncementCard({ item }) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-outline-variant/30">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="headline-sm text-primary-fixed">{item.title}</h3>
        {item.target_role_name && (
          <span className="text-xs border border-primary/30 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
            {item.target_role_name}
          </span>
        )}
      </div>
      <p className="body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">{item.body}</p>
      <p className="mt-3 text-xs text-on-surface-variant">
        {new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
      </p>
    </div>
  )
}

function Sidebar({ tab, setTab, summary, user, logout }) {
  const application = summary?.application
  const assignedRole = application?.assigned_role
  const taskSummary = summary?.task_summary
  const pendingCount = taskSummary ? taskSummary.pending + taskSummary.in_progress : 0

  const initials = (() => {
    const f = (user?.first_name || '').trim()
    const l = (user?.last_name || '').trim()
    if (f || l) return `${(f[0] || '').toUpperCase()}${(l[0] || '').toUpperCase()}` || 'V'
    return (user?.email?.[0] || 'V').toUpperCase()
  })()

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 fixed top-0 left-0 h-screen bg-[#131313] border-r border-outline-variant/10 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-outline-variant/10">
        <Link to="/">
          <img src={logo} alt="Ummah Tech Fest" className="h-9 w-auto object-contain" />
        </Link>
      </div>

      {/* User profile */}
      <div className="px-6 py-5 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-fixed/15 flex items-center justify-center text-primary-fixed font-black text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {assignedRole?.name || 'Role pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Portal</p>
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                active
                  ? 'bg-primary-fixed/15 text-primary-fixed'
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${active ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                {t.icon}
              </span>
              <span className="flex-1 text-left">{t.label}</span>
              {t.id === 'tasks' && pendingCount > 0 && (
                <span className="bg-primary text-on-primary text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-outline-variant/10 space-y-1">
        <Link
          to="/volunteer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Back to site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-error/80 hover:bg-error/10 hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Log out
        </button>
      </div>
    </aside>
  )
}

function MobileTopBar({ tab, user, summary, logout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const assignedRole = summary?.application?.assigned_role

  const initials = (() => {
    const f = (user?.first_name || '').trim()
    const l = (user?.last_name || '').trim()
    if (f || l) return `${(f[0] || '').toUpperCase()}${(l[0] || '').toUpperCase()}` || 'V'
    return (user?.email?.[0] || 'V').toUpperCase()
  })()

  const tabLabel = TABS.find((t) => t.id === tab)?.label || 'Portal'

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#131313]/95 backdrop-blur-xl border-b border-outline-variant/10 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src={logo} alt="Ummah Tech Fest" className="h-7 w-auto object-contain" />
          </Link>
          <span className="text-outline-variant/40 text-lg">/</span>
          <span className="text-sm font-bold text-on-surface">{tabLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container/40 border border-outline-variant/20"
        >
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-primary-fixed/15 text-primary-fixed font-black text-[10px]">
            {initials}
          </div>
        </button>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between px-4 h-14 border-b border-outline-variant/10">
            <span className="text-sm font-bold text-on-surface">Menu</span>
            <button type="button" onClick={() => setMenuOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex items-center gap-3 p-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-fixed/15 flex items-center justify-center text-primary-fixed font-black text-sm shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email}
                </p>
                <p className="text-xs text-on-surface-variant">{assignedRole?.name || 'Role pending'}</p>
              </div>
            </div>
            <Link to="/volunteer" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              Back to site
            </Link>
            <button
              type="button"
              onClick={() => { logout(); setMenuOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-error hover:bg-error/10 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function MobileBottomNav({ tab, setTab, taskSummary }) {
  const pendingCount = taskSummary ? taskSummary.pending + taskSummary.in_progress : 0

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#131313]/95 backdrop-blur-xl border-t border-outline-variant/10 flex">
      {TABS.map((t) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors relative ${
              active ? 'text-primary-fixed' : 'text-on-surface-variant'
            }`}
          >
            <span className="relative inline-flex">
              <span className={`material-symbols-outlined text-2xl ${active ? 'text-primary-fixed' : ''}`}>{t.icon}</span>
              {t.id === 'tasks' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default function VolunteerPortal() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('home')
  const [summary, setSummary] = useState(null)
  const [tasks, setTasks] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState(null)
  const [taskFilter, setTaskFilter] = useState('all')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login', { state: { from: '/volunteer/portal' } })
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)
    volunteerApi
      .portalSummary()
      .then((res) => setSummary(res.data))
      .catch((err) => {
        if (err instanceof ApiError && err.code === 'NOT_ACCEPTED') {
          navigate('/volunteer/status', { state: { message: 'The volunteer portal is only available to accepted volunteers.' } })
        } else {
          setError('Unable to load your portal.')
        }
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const loadTasks = useCallback(() => {
    setTasksLoading(true)
    volunteerApi
      .portalTasks()
      .then((res) => setTasks(res.data || []))
      .catch(() => setError('Unable to load tasks.'))
      .finally(() => setTasksLoading(false))
  }, [])

  const loadAnnouncements = useCallback(() => {
    setAnnouncementsLoading(true)
    volunteerApi
      .portalAnnouncements()
      .then((res) => setAnnouncements(res.data || []))
      .catch(() => setError('Unable to load announcements.'))
      .finally(() => setAnnouncementsLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'tasks' && summary) loadTasks()
    if (tab === 'announcements' && summary) loadAnnouncements()
  }, [tab, summary, loadTasks, loadAnnouncements])

  const handleToggleTask = async (taskId, newStatus) => {
    setToggling(taskId)
    setError('')
    try {
      const res = await volunteerApi.updatePortalTask(taskId, { status: newStatus })
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)))
      setSummary((prev) => {
        if (!prev) return prev
        const delta = newStatus === 'done' ? 1 : -1
        return {
          ...prev,
          task_summary: {
            ...prev.task_summary,
            done: prev.task_summary.done + delta,
            pending: prev.task_summary.pending - delta,
          },
        }
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update task.')
    } finally {
      setToggling(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-on-surface-variant body-md">Loading your portal…</p>
      </div>
    )
  }

  if (!summary) return null

  const { application, task_summary, recent_announcements } = summary
  const assignedRole = application?.assigned_role
  const preferredRoles = application?.preferred_roles || []
  const totalTasks = (task_summary?.pending || 0) + (task_summary?.in_progress || 0) + (task_summary?.done || 0)
  const completionPct = totalTasks > 0 ? Math.round(((task_summary?.done || 0) / totalTasks) * 100) : 0
  const filteredTasks = taskFilter === 'all' ? tasks : tasks.filter((t) => t.status === taskFilter)

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar tab={tab} setTab={setTab} summary={summary} user={user} logout={logout} />
      <MobileTopBar tab={tab} user={user} summary={summary} logout={logout} />

      {/* Main content */}
      <main className="flex-1 lg:pl-64 xl:pl-72 pt-14 lg:pt-0 pb-24 lg:pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

          {/* Page header */}
          <header className="mb-8">
            <p className="label-md text-primary-fixed uppercase tracking-widest mb-1">Volunteer Portal</p>
            <h1 className="headline-lg text-primary">
              {tab === 'home' && `Welcome back${user?.first_name ? `, ${user.first_name}` : ''}.`}
              {tab === 'tasks' && 'Your Tasks'}
              {tab === 'announcements' && 'Announcements'}
            </h1>
            {tab === 'home' && assignedRole && (
              <p className="body-lg text-on-surface-variant mt-1">
                Role: <span className="text-primary-fixed font-semibold">{assignedRole.name}</span>
              </p>
            )}
          </header>

          {error && (
            <p className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 body-md text-error" role="alert">
              {error}
            </p>
          )}

          {/* ── Overview tab ── */}
          {tab === 'home' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Pending',    value: task_summary?.pending ?? 0,    icon: 'radio_button_unchecked', color: 'text-on-surface-variant' },
                  { label: 'In Progress',value: task_summary?.in_progress ?? 0,icon: 'pending',                color: 'text-primary' },
                  { label: 'Completed',  value: task_summary?.done ?? 0,       icon: 'task_alt',               color: 'text-primary-fixed' },
                  { label: 'Progress',   value: `${completionPct}%`,            icon: 'donut_large',            color: 'text-secondary-fixed' },
                ].map((s) => (
                  <div key={s.label} className="glass-card p-5 rounded-2xl border border-outline-variant/30 text-center">
                    <span className={`material-symbols-outlined text-3xl mb-2 ${s.color}`}>{s.icon}</span>
                    <p className="headline-md text-on-surface font-bold">{s.value}</p>
                    <p className="label-md text-on-surface-variant text-sm">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card p-6 rounded-2xl border border-primary-fixed/20">
                <h2 className="headline-sm text-primary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined">badge</span>
                  Assignment
                </h2>
                {assignedRole ? (
                  <div className="space-y-1">
                    <p className="body-lg font-semibold text-primary-fixed">{assignedRole.name}</p>
                    {assignedRole.description && (
                      <p className="body-md text-on-surface-variant">{assignedRole.description}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="body-md text-on-surface-variant">No role assigned yet — our team will update this soon.</p>
                    {preferredRoles.length > 0 && (
                      <p className="body-md text-sm text-on-surface-variant">
                        Your preferred pathways: {preferredRoles.map((r) => r.name).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {totalTasks > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="headline-sm text-primary">Tasks</h2>
                    <button type="button" onClick={() => setTab('tasks')} className="text-sm text-primary-fixed hover:underline">
                      View all →
                    </button>
                  </div>
                  <button type="button" onClick={() => setTab('tasks')} className="text-sm text-primary-fixed hover:underline">
                    Open task board →
                  </button>
                </div>
              )}

              {recent_announcements.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="headline-sm text-primary">Latest Announcements</h2>
                    <button type="button" onClick={() => setTab('announcements')} className="text-sm text-primary-fixed hover:underline">
                      View all →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recent_announcements.slice(0, 2).map((a) => (
                      <AnnouncementCard key={a.id} item={a} />
                    ))}
                  </div>
                </div>
              )}

              {totalTasks === 0 && recent_announcements.length === 0 && (
                <div className="glass-card p-10 rounded-2xl text-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">volunteer_activism</span>
                  <p className="headline-sm text-on-surface mb-2">You're all set</p>
                  <p className="body-md text-on-surface-variant">Tasks and announcements from the organising team will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Tasks tab ── */}
          {tab === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'in_progress', 'done'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setTaskFilter(f)}
                      className={`px-3 py-1 rounded-lg label-md text-sm transition-colors ${
                        taskFilter === f
                          ? 'bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30'
                          : 'text-on-surface-variant border border-outline-variant/30 hover:bg-surface-bright/20'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {tasksLoading ? (
                <p className="body-md text-on-surface-variant">Loading tasks…</p>
              ) : filteredTasks.length === 0 ? (
                <div className="glass-card p-10 rounded-2xl text-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">task_alt</span>
                  <p className="body-md text-on-surface-variant">
                    {taskFilter === 'all' ? 'No tasks assigned yet.' : `No ${taskFilter.replace('_', ' ')} tasks.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={handleToggleTask} toggling={toggling} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Announcements tab ── */}
          {tab === 'announcements' && (
            <div>
              {announcementsLoading ? (
                <p className="body-md text-on-surface-variant">Loading announcements…</p>
              ) : announcements.length === 0 ? (
                <div className="glass-card p-10 rounded-2xl text-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">campaign</span>
                  <p className="body-md text-on-surface-variant">No announcements yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <AnnouncementCard key={a.id} item={a} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <MobileBottomNav tab={tab} setTab={setTab} taskSummary={task_summary} />
    </div>
  )
}
