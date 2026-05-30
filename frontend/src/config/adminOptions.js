/** Controlled values for CMS / admin forms — reduces typos and invalid API payloads. */

export const PASS_FLOW_OPTIONS = [
  { value: 'open', label: 'Open — paid / standard registration' },
  { value: 'approval', label: 'Approval — application reviewed first' },
]

export const PASS_TAG_BY_FLOW = {
  open: 'Open',
  approval: 'Approval',
}

export const PASS_ICON_OPTIONS = [
  { value: 'badge', label: 'Badge' },
  { value: 'school', label: 'School' },
  { value: 'rocket_launch', label: 'Rocket' },
  { value: 'person', label: 'Person' },
  { value: 'account_balance', label: 'Institution' },
  { value: 'monitoring', label: 'Chart' },
  { value: 'mic', label: 'Microphone' },
  { value: 'movie_filter', label: 'Media' },
  { value: 'volunteer_activism', label: 'Volunteer' },
  { value: 'confirmation_number', label: 'Ticket' },
  { value: 'handshake', label: 'Handshake' },
]

export const PASS_COLOR_OPTIONS = [
  { value: 'primary-fixed', label: 'Primary (lime)' },
  { value: 'secondary', label: 'Secondary (gold)' },
  { value: 'primary', label: 'Primary dark' },
]

export const SPONSOR_TIER_OPTIONS = [
  { value: 'global_partner', label: 'Global partner' },
  { value: 'sponsor', label: 'Sponsor' },
]

export const SCHEDULE_ITEM_TYPE_OPTIONS = [
  { value: 'session', label: 'Session' },
  { value: 'break', label: 'Break / intermission' },
]

export const SCHEDULE_DAY_OPTIONS = [
  { value: 1, label: 'Day 1', dayLabel: '01' },
  { value: 2, label: 'Day 2', dayLabel: '02' },
  { value: 3, label: 'Day 3', dayLabel: '03' },
]

export const SCHEDULE_TRACK_OPTIONS = [
  { value: '', label: '— No track —' },
  { value: 'main_stage', label: 'Main Stage' },
  { value: 'ai_ethics', label: 'AI & Ethics' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'workshop', label: 'Hands-on Workshop' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
]

export const SCHEDULE_TIME_PRESETS = [
  { value: '09:00', label: '09:00', display: '09:00 AM' },
  { value: '10:00', label: '10:00', display: '10:00 AM' },
  { value: '10:30', label: '10:30', display: '10:30 AM' },
  { value: '12:00', label: '12:00', display: '12:00 PM' },
  { value: '13:30', label: '13:30', display: '01:30 PM' },
  { value: '18:00', label: '18:00', display: '06:00 PM' },
]

export const SCHEDULE_TIME_LABEL_PRESETS = [
  '09:00 AM',
  '09:00 AM — 10:30 AM',
  '10:30 AM — 11:45 AM',
  '12:00 PM',
  '01:30 PM — 04:00 PM',
  '06:00 PM',
  'LIVE NOW',
]

export const SUBMISSION_PARTNER_STATUS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
]

export const SUBMISSION_SPEAKER_STATUS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

export const SUBMISSION_WAITLIST_STATUS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
]

export const VOLUNTEER_APPLICATION_STATUS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under review' },
  { value: 'interview', label: 'Interview' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]
