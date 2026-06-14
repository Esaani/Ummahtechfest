import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { registrationsApi } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n === undefined || n === null) return '—'
  return Number(n).toLocaleString()
}

function fmtGhs(amount) {
  if (!amount) return 'GHS 0'
  return `GHS ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent = false, to }) {
  const inner = (
    <div
      className={`glass-card rounded-2xl p-6 flex flex-col gap-3 border transition-all duration-300 hover:scale-[1.02] ${
        accent
          ? 'border-[var(--primary-neon)]/30 hover:border-[var(--primary-neon)]/60 hover:shadow-[0_0_24px_rgba(163,250,1,0.15)]'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`material-symbols-outlined text-3xl ${accent ? 'text-[var(--primary-neon)]' : 'text-primary-fixed'}`}
        >
          {icon}
        </span>
        {to && (
          <span className="material-symbols-outlined text-lg text-on-surface-variant opacity-50">
            chevron_right
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-headline font-bold text-on-surface">{value}</p>
        <p className="text-sm font-technical text-on-surface-variant mt-0.5">{label}</p>
      </div>
      {sub && <p className="text-xs text-on-surface-variant/70 font-technical">{sub}</p>}
    </div>
  )
  if (to) return <Link to={to}>{inner}</Link>
  return inner
}

function ProgressBar({ label, value, total, color = '#a3fa01' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs font-technical text-on-surface-variant">
        <span>{label}</span>
        <span>
          {fmt(value)} <span className="opacity-50">/ {fmt(total)}</span>
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, to, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-xl text-primary-fixed">{icon}</span>
        <h2 className="headline-sm text-on-surface">{title}</h2>
      </div>
      {to && (
        <Link
          to={to}
          className="text-xs font-technical text-[var(--primary-neon)] hover:opacity-80 transition-opacity flex items-center gap-1"
        >
          {linkLabel || 'View all'}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel rounded-xl px-4 py-2 border border-white/15 text-sm">
        <p className="font-technical text-on-surface-variant">{label}</p>
        <p className="font-bold text-[var(--primary-neon)]">{payload[0].value} registrations</p>
      </div>
    )
  }
  return null
}

// ─── quick actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: 'how_to_reg', label: 'Review Submissions', to: 'submissions', color: '#a3fa01' },
  { icon: 'record_voice_over', label: 'Speaker Apps', to: 'submissions', color: '#e9c349' },
  { icon: 'group', label: 'Manage Users', to: 'users', color: '#60a5fa' },
  { icon: 'calendar_month', label: 'Edit Schedule', to: 'schedule', color: '#f472b6' },
  { icon: 'campaign', label: 'Manage Sponsors', to: 'sponsors', color: '#fb923c' },
  { icon: 'home', label: 'Home Content', to: 'home', color: '#a78bfa' },
]

// ─── main component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    registrationsApi
      .adminDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const reg = stats?.registrations || {}
  const spk = stats?.speakers || {}
  const vol = stats?.volunteers || {}
  const don = stats?.donations || {}
  const spo = stats?.sponsors || {}
  const sch = stats?.schedule || {}

  // Build chart data (fill gaps with 0 so the line looks continuous)
  const trendData = (() => {
    if (!reg.trend?.length) return []
    return reg.trend.map((d) => ({ date: fmtDate(d.date), count: d.count }))
  })()

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="headline-lg text-primary mb-1">Admin Dashboard</h1>
        <p className="body-md text-on-surface-variant">
          Welcome back,{' '}
          <strong>{user?.first_name || user?.email?.split('@')[0] || 'Admin'}</strong>
          {user?.admin_role_label ? ` · ${user.admin_role_label}` : ''}. Here's your event at a glance.
        </p>
      </div>

      {/* ── Error banner ───────────────────────────────────── */}
      {error && (
        <div className="glass-panel rounded-xl p-4 border border-red-500/30 text-red-400 text-sm font-technical flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">warning</span>
          Could not load live stats — showing placeholder data. ({error})
        </div>
      )}

      {/* ── Top stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="how_to_reg"
          label="Total Registrations"
          value={loading ? '…' : fmt(reg.total)}
          sub={`${fmt(reg.pending)} pending review`}
          accent
          to="submissions"
        />
        <StatCard
          icon="record_voice_over"
          label="Speaker Applications"
          value={loading ? '…' : fmt(spk.total)}
          sub={`${fmt(spk.pending)} awaiting review`}
          to="submissions"
        />
        <StatCard
          icon="volunteer_activism"
          label="Volunteer Applications"
          value={loading ? '…' : fmt(vol.total)}
          sub={`${fmt(vol.pending)} pending`}
          to="submissions"
        />
        <StatCard
          icon="payments"
          label="Donations Received"
          value={loading ? '…' : fmtGhs(don.total_amount)}
          sub={`${fmt(don.count)} donation${don.count !== 1 ? 's' : ''}`}
        />
      </div>

      {/* ── Registration Trend ─────────────────────────────── */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <SectionTitle icon="trending_up" title="Registration Trend — Last 30 Days" />
        {loading ? (
          <div className="h-48 flex items-center justify-center text-on-surface-variant/50 font-technical text-sm animate-pulse">
            Loading chart…
          </div>
        ) : trendData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-on-surface-variant/40 font-technical text-sm">
            No registrations in the last 30 days.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3fa01" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a3fa01" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#a3fa01"
                strokeWidth={2}
                fill="url(#trendGrad)"
                dot={{ r: 3, fill: '#a3fa01', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#a3fa01', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Speaker Stats + Volunteer Stats ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speakers */}
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <SectionTitle
            icon="record_voice_over"
            title="Speaker Applications"
            to="submissions"
          />
          <div className="space-y-4 mt-2">
            <ProgressBar label="Pending" value={spk.pending} total={spk.total} color="#e9c349" />
            <ProgressBar label="Approved" value={spk.approved} total={spk.total} color="#a3fa01" />
            <ProgressBar label="Rejected" value={spk.rejected} total={spk.total} color="#f87171" />
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 flex gap-4 text-sm font-technical text-on-surface-variant">
            <div>
              <span className="text-on-surface font-bold text-lg">{fmt(spk.total)}</span>
              <span className="ml-1">total</span>
            </div>
            <div>
              <span className="text-[var(--secondary-gold)] font-bold text-lg">{fmt(spk.pending)}</span>
              <span className="ml-1">pending</span>
            </div>
            <div>
              <span className="text-[var(--primary-neon)] font-bold text-lg">{fmt(spk.approved)}</span>
              <span className="ml-1">approved</span>
            </div>
          </div>
        </div>

        {/* Volunteers */}
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <SectionTitle
            icon="group"
            title="Volunteer Applications"
            to="submissions"
          />
          <div className="space-y-4 mt-2">
            <ProgressBar label="Pending" value={vol.pending} total={vol.total} color="#e9c349" />
            <ProgressBar label="Approved" value={vol.approved} total={vol.total} color="#a3fa01" />
            <ProgressBar label="Rejected" value={vol.rejected} total={vol.total} color="#f87171" />
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 flex gap-4 text-sm font-technical text-on-surface-variant">
            <div>
              <span className="text-on-surface font-bold text-lg">{fmt(vol.total)}</span>
              <span className="ml-1">total</span>
            </div>
            <div>
              <span className="text-[var(--secondary-gold)] font-bold text-lg">{fmt(vol.pending)}</span>
              <span className="ml-1">pending</span>
            </div>
            <div>
              <span className="text-[var(--primary-neon)] font-bold text-lg">{fmt(vol.approved)}</span>
              <span className="ml-1">approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Donations & Sponsors + Schedule ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Donations */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 col-span-1 md:col-span-2">
          <SectionTitle icon="payments" title="Donations & Sponsors" />
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-technical text-on-surface-variant uppercase tracking-widest">
                Total Donations
              </p>
              <p className="text-3xl font-headline font-bold text-[var(--primary-neon)]">
                {loading ? '…' : fmtGhs(don.total_amount)}
              </p>
              <p className="text-sm text-on-surface-variant font-technical">
                {fmt(don.count)} successful donation{don.count !== 1 ? 's' : ''}
              </p>
              <div className="mt-auto pt-4">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#a3fa01] to-[#e9c349] transition-all duration-700"
                    style={{ width: don.count > 0 ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-6 border-l border-white/10">
              <p className="text-xs font-technical text-on-surface-variant uppercase tracking-widest">
                Sponsor Inquiries
              </p>
              <p className="text-3xl font-headline font-bold text-[var(--secondary-gold)]">
                {loading ? '…' : fmt(spo.total)}
              </p>
              <p className="text-sm text-on-surface-variant font-technical">
                Total inquiries received
              </p>
              <Link
                to="sponsors"
                className="mt-auto text-xs font-technical text-[var(--primary-neon)] hover:opacity-80 flex items-center gap-1 transition-opacity"
              >
                Manage sponsors
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <SectionTitle icon="calendar_month" title="Session Schedule" to="schedule" />
          <div className="flex-1 flex flex-col items-center justify-center py-4 gap-3">
            <span className="material-symbols-outlined text-6xl text-primary-fixed/60">
              event_note
            </span>
            <p className="text-4xl font-headline font-bold text-on-surface">
              {loading ? '…' : fmt(sch.session_count)}
            </p>
            <p className="text-sm text-on-surface-variant font-technical text-center">
              scheduled session{sch.session_count !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="schedule"
            className="w-full text-center py-3 rounded-xl border border-primary-fixed/30 text-primary-fixed font-technical text-sm font-semibold hover:bg-primary-fixed/10 transition-colors"
          >
            Manage Schedule
          </Link>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <SectionTitle icon="bolt" title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to + action.label}
              to={action.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200 group"
            >
              <span
                className="material-symbols-outlined text-3xl transition-transform duration-200 group-hover:scale-110"
                style={{ color: action.color }}
              >
                {action.icon}
              </span>
              <span className="text-xs font-technical text-on-surface-variant text-center leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Registration status breakdown ──────────────────── */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <SectionTitle icon="donut_large" title="Registration Status Breakdown" to="submissions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: reg.total, color: 'text-on-surface' },
            { label: 'Pending / Under Review', value: reg.pending, color: 'text-[var(--secondary-gold)]' },
            { label: 'Approved', value: reg.approved, color: 'text-[var(--primary-neon)]' },
            { label: 'Paid', value: reg.paid, color: 'text-blue-400' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center gap-1 py-5 px-3 rounded-xl bg-white/5 border border-white/10"
            >
              <p className={`text-3xl font-headline font-bold ${item.color}`}>
                {loading ? '…' : fmt(item.value)}
              </p>
              <p className="text-xs font-technical text-on-surface-variant text-center">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer note ─────────────────────────────────────── */}
      <p className="text-xs font-technical text-on-surface-variant/40 text-center pb-4">
        Ummah Tech Fest Ghana 2026 · Admin Portal · Data updates in real time
      </p>
    </div>
  )
}
