import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, volunteerApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'tasks', label: 'Tasks', icon: 'task_alt' },
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

export default function VolunteerPortal() {
  const { isAuthenticated, loading: authLoading } = useAuth()
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
      // Update summary counts
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
      <main className="pt-32 pb-20 text-center">
        <p className="text-on-surface-variant body-md">Loading your portal…</p>
      </main>
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
    <main className="pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Header */}
      <header className="mb-10" data-aos="fade-up">
        <p className="label-md text-primary-fixed uppercase tracking-widest mb-2">Volunteer Portal</p>
        <h1 className="headline-lg text-primary">Welcome back{application?.user?.first_name ? `, ${application.user.first_name}` : ''}.</h1>
        {assignedRole && (
          <p className="body-lg text-on-surface-variant mt-2">
            Your role: <span className="text-primary-fixed font-semibold">{assignedRole.name}</span>
          </p>
        )}
      </header>

      {error && (
        <p className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 body-md text-error" role="alert">
          {error}
        </p>
      )}

      {/* Tab nav */}
      <div className="flex gap-2 mb-8 flex-wrap">
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
            {t.id === 'tasks' && task_summary && (task_summary.pending + task_summary.in_progress) > 0 && (
              <span className="ml-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {task_summary.pending + task_summary.in_progress}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Home tab ── */}
      {tab === 'home' && (
        <div className="space-y-8" data-aos="fade-up">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: task_summary?.pending ?? 0, icon: 'radio_button_unchecked', color: 'text-on-surface-variant' },
              { label: 'In Progress', value: task_summary?.in_progress ?? 0, icon: 'pending', color: 'text-primary' },
              { label: 'Completed', value: task_summary?.done ?? 0, icon: 'task_alt', color: 'text-primary-fixed' },
              { label: 'Progress', value: `${completionPct}%`, icon: 'donut_large', color: 'text-secondary-fixed' },
            ].map((s) => (
              <div key={s.label} className="glass-card p-5 rounded-2xl border border-outline-variant/30 text-center">
                <span className={`material-symbols-outlined text-3xl mb-2 ${s.color}`}>{s.icon}</span>
                <p className="headline-md text-on-surface font-bold">{s.value}</p>
                <p className="label-md text-on-surface-variant text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Role card */}
          <div className="glass-card p-8 rounded-2xl border border-primary-fixed/20">
            <h2 className="headline-sm text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">badge</span>
              Your Assignment
            </h2>
            {assignedRole ? (
              <div className="space-y-2">
                <p className="body-lg font-semibold text-primary-fixed">{assignedRole.name}</p>
                {assignedRole.description && (
                  <p className="body-md text-on-surface-variant">{assignedRole.description}</p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="body-md text-on-surface-variant">No role assigned yet. Our team will update this soon.</p>
                {preferredRoles.length > 0 && (
                  <p className="body-md text-sm text-on-surface-variant">
                    Your preferred pathways: {preferredRoles.map((r) => r.name).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recent tasks preview */}
          {totalTasks > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="headline-sm text-primary">Recent Tasks</h2>
                <button type="button" onClick={() => setTab('tasks')} className="label-md text-primary-fixed hover:underline text-sm">
                  View all →
                </button>
              </div>
              <div className="space-y-3">
                {recent_announcements.length === 0 && task_summary.pending + task_summary.in_progress === 0 ? (
                  <p className="body-md text-on-surface-variant">All tasks complete.</p>
                ) : null}
              </div>
              <button type="button" onClick={() => setTab('tasks')} className="body-md text-primary-fixed hover:underline text-sm">
                Open task board →
              </button>
            </div>
          )}

          {/* Recent announcements preview */}
          {recent_announcements.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="headline-sm text-primary">Latest Announcements</h2>
                <button type="button" onClick={() => setTab('announcements')} className="label-md text-primary-fixed hover:underline text-sm">
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
              <p className="headline-sm text-on-surface mb-2">You're all set!</p>
              <p className="body-md text-on-surface-variant">Tasks and announcements from the organising team will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tasks tab ── */}
      {tab === 'tasks' && (
        <div data-aos="fade-up">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="headline-sm text-primary">Your Tasks</h2>
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
        <div data-aos="fade-up">
          <h2 className="headline-sm text-primary mb-6">Announcements</h2>
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

      <Link to="/volunteer" className="inline-block mt-12 text-primary-fixed label-md">
        ← Volunteer program
      </Link>
    </main>
  )
}
