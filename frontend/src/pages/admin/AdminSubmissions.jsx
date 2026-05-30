import { Fragment, useCallback, useEffect, useState } from 'react'
import { ApiError, outreachApi, volunteerApi } from '../../api/client'
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

function StatusSelect({ value, options, onChange, disabled }) {
  return (
    <select
      className="bg-surface-container border border-outline-variant/40 rounded-lg px-2 py-1 text-xs label-md"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
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
      const res = await updater(id, { status })
      setItems((prev) => prev.map((row) => (row.id === id ? res.data : row)))
      if (detail?.id === id) setDetail(res.data)
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

  const patchVolunteer = async (id, payload) => {
    setUpdatingId(id)
    try {
      const res = await volunteerApi.updateAdminApplication(id, payload)
      setItems((prev) => prev.map((row) => (row.id === id ? res.data : row)))
      if (detail?.id === id) setDetail(res.data)
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
                      <StatusSelect
                        value={row.status}
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
                          if (tab === 'volunteers') {
                            patchVolunteer(row.id, { status })
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
                      />
                    </td>
                  </tr>
                  {expandedId === row.id && detail && (
                    <tr>
                      <td colSpan={6} className="pb-6">
                        <div className="glass-panel p-6 rounded-xl text-sm space-y-3">
                          {tab === 'partners' && detail.requirements && (
                            <p><span className="text-on-surface-variant">Requirements:</span> {detail.requirements}</p>
                          )}
                          {tab === 'speakers' && (
                            <>
                              <p><span className="text-on-surface-variant">Bio:</span> {detail.bio}</p>
                              <p><span className="text-on-surface-variant">Abstract:</span> {detail.abstract}</p>
                              <p><span className="text-on-surface-variant">Takeaways:</span> {detail.key_takeaways}</p>
                              {(detail.linkedin_url || detail.twitter_handle) && (
                                <p>
                                  <span className="text-on-surface-variant">Social:</span>{' '}
                                  {detail.linkedin_url} {detail.twitter_handle}
                                </p>
                              )}
                            </>
                          )}
                          {tab === 'volunteers' && (
                            <>
                              <p><span className="text-on-surface-variant">Skills:</span> {detail.skills_summary}</p>
                              <p><span className="text-on-surface-variant">Motivation:</span> {detail.motivation}</p>
                              {(detail.city || detail.country) && (
                                <p>
                                  <span className="text-on-surface-variant">Location:</span>{' '}
                                  {[detail.city, detail.country].filter(Boolean).join(', ')}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 pt-2">
                                <label className="flex flex-col gap-1">
                                  <span className="text-on-surface-variant text-xs uppercase">Assigned role</span>
                                  <select
                                    className="bg-surface-container border border-outline-variant/40 rounded-lg px-2 py-1"
                                    value={detail.assigned_role?.id || ''}
                                    disabled={updatingId === detail.id}
                                    onChange={(e) =>
                                      patchVolunteer(detail.id, {
                                        assigned_role_id: e.target.value || null,
                                      })
                                    }
                                  >
                                    <option value="">—</option>
                                    {volunteerRoles.map((r) => (
                                      <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                  </select>
                                </label>
                              </div>
                              <label className="block pt-2">
                                <span className="text-on-surface-variant text-xs uppercase">Admin notes</span>
                                <textarea
                                  className="mt-1 w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 min-h-[80px]"
                                  defaultValue={detail.admin_notes || ''}
                                  disabled={updatingId === detail.id}
                                  onBlur={(e) => {
                                    if (e.target.value !== (detail.admin_notes || '')) {
                                      patchVolunteer(detail.id, { admin_notes: e.target.value })
                                    }
                                  }}
                                />
                              </label>
                            </>
                          )}
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
