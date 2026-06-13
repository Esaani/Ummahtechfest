import { Fragment, useCallback, useEffect, useState } from 'react'
import { ApiError, authApi, outreachApi, volunteerApi } from '../../api/client'
import {
  SUBMISSION_PARTNER_STATUS,
  SUBMISSION_SPEAKER_STATUS,
  SUBMISSION_WAITLIST_STATUS,
  VOLUNTEER_APPLICATION_STATUS,
} from '../../config/adminOptions'

const TABS = [
  { id: 'partners', label: 'Sponsor inquiries', icon: 'handshake' },
  { id: 'speakers', label: 'Speaker applications', icon: 'mic' },
  { id: 'waitlist', label: 'Ticket waitlist', icon: 'confirmation_number' },
  { id: 'volunteers', label: 'Volunteer applications', icon: 'volunteer_activism' },
]

const PARTNER_STATUS = SUBMISSION_PARTNER_STATUS
const SPEAKER_STATUS = SUBMISSION_SPEAKER_STATUS
const WAITLIST_STATUS = SUBMISSION_WAITLIST_STATUS
const VOLUNTEER_STATUS = VOLUNTEER_APPLICATION_STATUS

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function StatusSelect({ value, options, onChange, disabled, isStaged }) {
  return (
    <select
      className={`bg-surface-container border rounded-lg px-2 py-1 text-xs label-md transition-all ${
        isStaged ? 'border-primary shadow-[0_0_0_1px_rgba(var(--primary-rgb),0.2)]' : 'border-outline-variant/40'
      }`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label} {isStaged && o.value === value ? '(Staged)' : ''}
        </option>
      ))}
    </select>
  )
}

export default function AdminSubmissions() {
  const [tab, setTab] = useState('partners')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [volunteerRoles, setVolunteerRoles] = useState([])
  const [stagedStatus, setStagedStatus] = useState({})
  const [stagedNotes, setStagedNotes] = useState({})
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteType, setInviteType] = useState('speaker')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')

  useEffect(() => {
    if (tab === 'volunteers') {
      volunteerApi.adminRoles().then((res) => setVolunteerRoles(res.data || [])).catch(() => {})
    }
  }, [tab])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const req =
      tab === 'partners'
        ? outreachApi.adminSponsorInquiries()
        : tab === 'speakers'
          ? outreachApi.adminSpeakerApplications()
          : tab === 'volunteers'
            ? volunteerApi.adminApplications()
            : outreachApi.adminTicketWaitlist()
    req
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load submissions'))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => {
    load()
    setExpandedId(null)
    setDetail(null)
  }, [load])

  const updateStatus = async (id, status, updater) => {
    setUpdatingId(id)
    try {
      const res = await updater(id, { status, status_note: stagedNotes[id] || '' })
      setItems((prev) => prev.map((row) => (row.id === id ? res.data : row)))
      if (detail?.id === id) setDetail(res.data)
      setStagedStatus((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setStagedNotes((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null)
      setDetail(null)
      return
    }
    setExpandedId(id)
    if (tab === 'speakers' || tab === 'volunteers') {
      try {
        const res =
          tab === 'speakers'
            ? await outreachApi.getSpeakerApplication(id)
            : await volunteerApi.getAdminApplication(id)
        setDetail(res.data)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load application')
      }
    } else {
      setDetail(items.find((r) => r.id === id) || null)
    }
  }

  const handleParticipantInvite = async (e) => {
    e.preventDefault()
    setInviteSuccess('')
    setError('')
    setInviting(true)
    try {
      const email = inviteEmail.trim()
      await authApi.inviteParticipant({ email, invite_type: inviteType })
      setInviteEmail('')
      setInviteSuccess(`Invitation sent to ${email}.`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invite failed')
    } finally {
      setInviting(false)
    }
  }

  const patchVolunteer = async (id, payload) => {
    setUpdatingId(id)
    try {
      const res = await volunteerApi.updateAdminApplication(id, payload)
      setItems((prev) => prev.map((row) => (row.id === id ? res.data : row)))
      if (detail?.id === id) setDetail(res.data)
      if (payload.status) {
        setStagedStatus((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        setStagedNotes((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <h1 className="headline-lg text-primary mb-2">Submissions</h1>
      <p className="body-md text-on-surface-variant mb-8 max-w-2xl">
        Sponsor inquiries, speaker applications, ticket waitlist, and volunteer applications from the public site.
      </p>

      <section className="glass-card p-6 rounded-2xl border border-outline-variant/30 mb-8 max-w-xl">
        <h2 className="headline-sm text-primary mb-2">Invite speaker or volunteer</h2>
        <p className="body-md text-on-surface-variant text-sm mb-4">
          Sends an email link to register. Speakers complete onboarding after accepting; volunteers go to the apply form.
        </p>
        <form onSubmit={handleParticipantInvite} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label htmlFor="participant-invite-email" className="label-md text-on-surface-variant block mb-1">
              Email
            </label>
            <input
              id="participant-invite-email"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="form-control w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label htmlFor="participant-invite-type" className="label-md text-on-surface-variant block mb-1">
              Role
            </label>
            <select
              id="participant-invite-type"
              value={inviteType}
              onChange={(e) => setInviteType(e.target.value)}
              className="form-select rounded-lg border border-outline-variant/40 px-3 py-2 text-sm"
            >
              <option value="speaker">Speaker</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="btn-primary px-6 py-2 rounded-lg label-md font-bold whitespace-nowrap disabled:opacity-60"
          >
            {inviting ? 'Sending…' : 'Send invite'}
          </button>
        </form>
        {inviteSuccess && <p className="mt-3 body-md text-primary-fixed">{inviteSuccess}</p>}
      </section>

      <div className="flex flex-wrap gap-2 mb-8">
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

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

      {loading ? (
        <p className="body-md text-on-surface-variant">Loading…</p>
      ) : items.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center">
          <p className="body-md text-on-surface-variant">No submissions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-outline-variant/30 label-md text-on-surface-variant uppercase text-[10px]">
                {tab === 'partners' && (
                  <>
                    <th className="py-3 pr-4">Company</th>
                    <th className="py-3 pr-4">Contact</th>
                    <th className="py-3 pr-4">Tier</th>
                  </>
                )}
                {tab === 'speakers' && (
                  <>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Session</th>
                    <th className="py-3 pr-4">Track</th>
                  </>
                )}
                {tab === 'waitlist' && (
                  <>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Interest</th>
                  </>
                )}
                {tab === 'volunteers' && (
                  <>
                    <th className="py-3 pr-4">Applicant</th>
                    <th className="py-3 pr-4">Pathways</th>
                    <th className="py-3 pr-4">Experience</th>
                  </>
                )}
                <th className="py-3 pr-4">Submitted</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-outline-variant/20 body-md">
                    {tab === 'partners' && (
                      <>
                        <td className="py-4 pr-4">
                          <button
                            type="button"
                            className="text-left font-medium text-primary hover:underline"
                            onClick={() => toggleExpand(row.id)}
                          >
                            {row.company_name}
                          </button>
                        </td>
                        <td className="py-4 pr-4">
                          <div>{row.full_name}</div>
                          <a href={`mailto:${row.email}`} className="text-sm text-secondary-fixed">{row.email}</a>
                        </td>
                        <td className="py-4 pr-4">{row.tier_interest_label || row.tier_interest}</td>
                      </>
                    )}
                    {tab === 'speakers' && (
                      <>
                        <td className="py-4 pr-4">
                          <button
                            type="button"
                            className="text-left font-medium text-primary-fixed hover:underline"
                            onClick={() => toggleExpand(row.id)}
                          >
                            {row.full_name}
                          </button>
                          <div className="text-sm text-on-surface-variant">{row.email}</div>
                        </td>
                        <td className="py-4 pr-4 max-w-[200px] truncate">{row.session_title}</td>
                        <td className="py-4 pr-4">{row.track_label || row.track}</td>
                      </>
                    )}
                    {tab === 'waitlist' && (
                      <>
                        <td className="py-4 pr-4 font-medium text-primary">{row.full_name}</td>
                        <td className="py-4 pr-4">
                          <a href={`mailto:${row.email}`} className="text-secondary-fixed">{row.email}</a>
                        </td>
                        <td className="py-4 pr-4">{row.tier_interest_label || row.tier_interest}</td>
                      </>
                    )}
                    {tab === 'volunteers' && (
                      <>
                        <td className="py-4 pr-4">
                          <button
                            type="button"
                            className="text-left font-medium text-primary hover:underline"
                            onClick={() => toggleExpand(row.id)}
                          >
                            {row.user?.full_name || row.user?.email}
                          </button>
                          <a href={`mailto:${row.user?.email}`} className="text-sm text-secondary-fixed block">
                            {row.user?.email}
                          </a>
                        </td>
                        <td className="py-4 pr-4 text-sm">
                          {(row.preferred_roles || []).map((r) => r.name).join(', ') || '—'}
                        </td>
                        <td className="py-4 pr-4">{row.experience_years} yrs</td>
                      </>
                    )}
                    <td className="py-4 pr-4 text-sm text-on-surface-variant whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <StatusSelect
                          value={stagedStatus[row.id] || row.status}
                          isStaged={!!stagedStatus[row.id]}
                          disabled={updatingId === row.id}
                          options={
                            tab === 'partners'
                              ? PARTNER_STATUS
                              : tab === 'speakers'
                                ? SPEAKER_STATUS
                                : tab === 'volunteers'
                                  ? VOLUNTEER_STATUS
                                  : WAITLIST_STATUS
                          }
                          onChange={(status) => {
                            if (status === row.status) {
                              setStagedStatus((prev) => {
                                const next = { ...prev }
                                delete next[row.id]
                                return next
                              })
                            } else {
                              setStagedStatus((prev) => ({ ...prev, [row.id]: status }))
                            }
                          }}
                        />
                        {stagedStatus[row.id] && (
                          <div className="flex flex-col gap-2">
                            <textarea
                              placeholder="Add a note to applicant..."
                              className="text-[10px] p-1 bg-surface-container-high border border-primary/20 rounded h-12 w-full focus:outline-none focus:border-primary/50"
                              value={stagedNotes[row.id] || ''}
                              onChange={(e) => setStagedNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                            />
                            <div className="flex gap-1 justify-end">
                              <button
                                type="button"
                                className="px-2 py-0.5 rounded text-[10px] border border-outline-variant hover:bg-surface-bright"
                                onClick={() => {
                                  setStagedStatus((prev) => {
                                    const n = { ...prev }; delete n[row.id]; return n
                                  })
                                  setStagedNotes((prev) => {
                                    const n = { ...prev }; delete n[row.id]; return n
                                  })
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="px-2 py-0.5 rounded text-[10px] bg-primary text-on-primary font-medium hover:bg-primary/90 flex items-center gap-1"
                                onClick={() => {
                                  const status = stagedStatus[row.id]
                                  if (tab === 'volunteers') {
                                    patchVolunteer(row.id, {
                                      status,
                                      status_note: stagedNotes[row.id] || '',
                                    })
                                    return
                                  }
                                  updateStatus(
                                    row.id,
                                    status,
                                    tab === 'partners'
                                      ? outreachApi.updateSponsorInquiry
                                      : tab === 'speakers'
                                        ? outreachApi.updateSpeakerApplication
                                        : outreachApi.updateTicketWaitlist,
                                  )
                                }}
                              >
                                <span className="material-symbols-outlined text-[12px]">check</span>
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === row.id && detail && (
                    <tr>
                      <td colSpan={6} className="pb-6">
                        <div className="glass-panel p-8 rounded-2xl shadow-xl border-primary/10 overflow-hidden relative">
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-base font-semibold text-primary flex items-center gap-2">
                              <span className="material-symbols-outlined">description</span>
                              Application Details
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              Submitted {formatDate(detail.created_at)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              {tab === 'partners' && (
                                <div className="space-y-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Company Bio / Requirements</label>
                                    <p className="text-on-surface leading-relaxed">{detail.requirements || 'N/A'}</p>
                                  </div>
                                </div>
                              )}

                              {tab === 'speakers' && (
                                <div className="space-y-6">
                                  <div className="flex flex-col sm:flex-row gap-4">
                                    {detail.profile_image_url ? (
                                      <img
                                        src={detail.profile_image_url}
                                        alt=""
                                        className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/10"
                                      />
                                    ) : (
                                      <div className="w-24 h-24 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant/30 text-on-surface-variant">
                                        <span className="material-symbols-outlined text-3xl">person</span>
                                      </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                      <div>
                                        <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Title & Organization</label>
                                        <p className="text-on-surface text-sm font-semibold">
                                          {detail.professional_title || '—'} {detail.organization ? `at ${detail.organization}` : ''}
                                        </p>
                                      </div>
                                      {(detail.occupation || detail.role) && (
                                        <div>
                                          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Occupation / Role</label>
                                          <p className="text-on-surface text-xs">
                                            {detail.occupation || '—'} {detail.role ? `(${detail.role})` : ''}
                                          </p>
                                        </div>
                                      )}
                                      <div>
                                        <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Social Links</label>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                                          {detail.linkedin_url && (
                                            <a href={detail.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                                              <span className="material-symbols-outlined text-[14px]">link</span> LinkedIn Profile
                                            </a>
                                          )}
                                          {detail.twitter_handle && (
                                            <div className="text-on-surface flex items-center gap-1 text-xs">
                                              <span className="material-symbols-outlined text-[14px]">alternate_email</span> @{detail.twitter_handle}
                                            </div>
                                          )}
                                          {detail.instagram_handle && (
                                            <div className="text-on-surface flex items-center gap-1 text-xs">
                                              <span className="material-symbols-outlined text-[14px]">group</span> {detail.instagram_handle}
                                            </div>
                                          )}
                                          {!detail.linkedin_url && !detail.twitter_handle && !detail.instagram_handle && (
                                            <span className="text-on-surface-variant italic text-xs">No social links</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/20">
                                    <div>
                                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Track</label>
                                      <p className="text-on-surface text-xs font-semibold">{detail.track_label || detail.track}</p>
                                    </div>
                                    <div>
                                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Format</label>
                                      <p className="text-on-surface text-xs font-semibold">{detail.session_format_label || detail.session_format}</p>
                                    </div>
                                    <div>
                                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Source</label>
                                      <p className="text-on-surface text-xs font-semibold">
                                        {detail.source === 'invited' ? 'Admin Invite' : 'Public App'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-outline-variant/20">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">CV / Resume</label>
                                    {detail.cv_url ? (
                                      <a
                                        href={detail.cv_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary-fixed/10 text-secondary-fixed hover:bg-secondary-fixed/20 transition-all text-xs font-semibold"
                                      >
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Download CV / Resume
                                      </a>
                                    ) : (
                                      <p className="text-xs text-on-surface-variant italic">No CV uploaded</p>
                                    )}
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Speaker Bio</label>
                                    <p className="text-on-surface leading-relaxed bg-surface-container/30 p-3 rounded-lg border border-outline-variant/20 text-sm whitespace-pre-wrap">{detail.bio}</p>
                                  </div>
                                </div>
                              )}

                              {tab === 'waitlist' && (
                                <div className="space-y-6">
                                  <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Waitlist Interest</label>
                                    <p className="text-on-surface text-lg font-medium">{detail.tier_interest_label || detail.tier_interest}</p>
                                  </div>
                                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                    <p className="text-xs text-primary font-medium mb-1">Waitlist Management</p>
                                    <p className="text-[11px] text-on-surface-variant">Update the status above to move this person through the registration funnel.</p>
                                  </div>
                                </div>
                              )}

                              {tab === 'volunteers' && (
                                <div className="space-y-6">
                                  <div className="flex flex-col sm:flex-row gap-4">
                                    {detail.profile_image_url ? (
                                      <img
                                        src={detail.profile_image_url}
                                        alt=""
                                        className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/10"
                                      />
                                    ) : (
                                      <div className="w-24 h-24 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant/30 text-on-surface-variant">
                                        <span className="material-symbols-outlined text-3xl">person</span>
                                      </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Occupation</label>
                                          <p className="text-on-surface text-sm font-semibold">
                                            {detail.occupation || '—'}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Contact Phone</label>
                                          <p className="text-on-surface text-sm">
                                            {detail.phone || '—'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                        <div>
                                          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Portfolio</label>
                                          {detail.portfolio_url ? (
                                            <a href={detail.portfolio_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                                              <span className="material-symbols-outlined text-[14px]">work</span> View Portfolio
                                            </a>
                                          ) : (
                                            <span className="text-on-surface-variant italic text-xs">No portfolio</span>
                                          )}
                                        </div>
                                        <div>
                                          <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">LinkedIn</label>
                                          {detail.linkedin_url ? (
                                            <a href={detail.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                                              <span className="material-symbols-outlined text-[14px]">link</span> LinkedIn Profile
                                            </a>
                                          ) : (
                                            <span className="text-on-surface-variant italic text-xs">No LinkedIn</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/20">
                                    <div>
                                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Location</label>
                                      <p className="text-on-surface flex items-center gap-1 text-xs font-semibold">
                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                        {[detail.city, detail.country].filter(Boolean).join(', ') || 'Remote'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Experience</label>
                                      <p className="text-on-surface text-xs font-semibold">{detail.experience_years} years</p>
                                    </div>
                                    <div>
                                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Conduct Accepted</label>
                                      <p className="text-on-surface text-xs font-semibold">
                                        {detail.code_of_conduct_accepted ? 'Yes' : 'No'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-outline-variant/20">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">CV / Resume</label>
                                    {detail.cv_url ? (
                                      <a
                                        href={detail.cv_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary-fixed/10 text-secondary-fixed hover:bg-secondary-fixed/20 transition-all text-xs font-semibold"
                                      >
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Download CV / Resume
                                      </a>
                                    ) : (
                                      <p className="text-xs text-on-surface-variant italic">No CV uploaded</p>
                                    )}
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Motivation & Interest</label>
                                    <p className="text-on-surface leading-relaxed bg-surface-container/30 p-3 rounded-lg border border-outline-variant/20 text-sm whitespace-pre-wrap">{detail.motivation}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="space-y-6">
                              {tab === 'speakers' && (
                                <div className="space-y-6">
                                  <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Talk Title & Abstract</label>
                                    <h5 className="text-sm font-bold text-on-surface">{detail.session_title}</h5>
                                    <p className="text-on-surface leading-relaxed text-sm pt-1 whitespace-pre-wrap">{detail.abstract}</p>
                                  </div>
                                  {detail.target_audience && (
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Target Audience</label>
                                      <p className="text-on-surface text-sm">{detail.target_audience}</p>
                                    </div>
                                  )}
                                  <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Key Takeaways</label>
                                    <p className="text-on-surface-variant leading-relaxed text-xs italic bg-surface-container/20 p-2.5 rounded border border-outline-variant/10 whitespace-pre-wrap">"{detail.key_takeaways}"</p>
                                  </div>
                                  {detail.tech_requirements && (
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Technical Requirements</label>
                                      <p className="text-on-surface text-xs leading-relaxed whitespace-pre-wrap">{detail.tech_requirements}</p>
                                    </div>
                                  )}
                                  {detail.co_speakers && (
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Co-Speakers</label>
                                      <p className="text-on-surface text-xs leading-relaxed whitespace-pre-wrap">{detail.co_speakers}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {tab === 'volunteers' && (
                                <div className="space-y-6">
                                  <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Skills Summary</label>
                                    <p className="text-on-surface leading-relaxed text-sm bg-surface-container/20 p-3 rounded-lg border border-outline-variant/10 whitespace-pre-wrap">{detail.skills_summary}</p>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Availability (Days)</label>
                                    <p className="text-on-surface text-sm font-semibold">
                                      {(detail.availability?.days || []).join(', ') || 'None specified'}
                                    </p>
                                  </div>
                                  
                                  <div className="pt-4 border-t border-outline-variant/30 space-y-4">
                                    <div className="flex flex-wrap gap-4">
                                      <label className="flex flex-col gap-1.5 flex-1 max-w-[240px]">
                                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">Assignment Decision</span>
                                        <div className="flex items-center gap-2">
                                          <select
                                            className="bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-sm w-full focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={detail.assigned_role?.id || ''}
                                            disabled={updatingId === detail.id}
                                            onChange={(e) =>
                                              patchVolunteer(detail.id, {
                                                assigned_role_id: e.target.value || null,
                                              })
                                            }
                                          >
                                            <option value="">No Role Assigned</option>
                                            {volunteerRoles.map((r) => (
                                              <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                          </select>
                                          {updatingId === detail.id && (
                                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                          )}
                                        </div>
                                      </label>
                                    </div>

                                    <label className="block">
                                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Private Admin Review Notes</span>
                                      <textarea
                                        className="mt-2 w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
                                        placeholder="Add private notes only visible to staff..."
                                        defaultValue={detail.admin_notes || ''}
                                        disabled={updatingId === detail.id}
                                        onBlur={(e) => {
                                          if (e.target.value !== (detail.admin_notes || '')) {
                                            patchVolunteer(detail.id, { admin_notes: e.target.value })
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}

                              {tab === 'partners' && (
                                <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                                   <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                      <p className="text-xs text-primary font-medium mb-1">Status Management</p>
                                      <p className="text-[11px] text-on-surface-variant">Update the partner status above to notify them of their acceptance or review stage.</p>
                                   </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
