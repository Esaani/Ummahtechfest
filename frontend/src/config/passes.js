/**
 * Pass registration availability.
 * wired: backend + UI flow complete for this step
 * flow: open | approval | volunteer
 */
export const PASSES = {
  delegate: {
    id: 'delegate',
    title: 'Delegate Pass',
    icon: 'badge',
    color: 'primary-fixed',
    tag: 'Open',
    tagBg: 'bg-primary-container text-on-primary-container',
    flow: 'open',
    wired: true,
    is_open_for_registration: false,
    desc: "Full Summit access for fintech professionals, ecosystem builders, corporate delegates, and anyone shaping Africa's digital economy.",
    features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
    cta: 'Register as Delegate',
  },
  policy: {
    id: 'policy',
    title: 'Policy Pass',
    icon: 'account_balance',
    color: 'secondary',
    tag: 'Approval',
    tagBg: 'bg-secondary-container text-on-secondary-container',
    flow: 'approval',
    wired: true,
    outline: true,
    desc: 'For government officials, policymakers, central bank staff, regulators, multilateral agencies, DFIs, and non-profit foundations.',
    features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
    cta: 'Apply for Policy Pass',
  },
  investor: {
    id: 'investor',
    title: 'Investor Pass',
    icon: 'monitoring',
    color: 'secondary',
    tag: 'Approval',
    tagBg: 'bg-secondary-container text-on-secondary-container',
    flow: 'approval',
    wired: true,
    outline: true,
    desc: 'For venture capitalists, private equity, angel investors, impact investors, and investment fund managers seeking deal flow in Africa.',
    features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
    cta: 'Apply for Investor Pass',
  },
  startup: {
    id: 'startup',
    title: 'Startup Pass',
    icon: 'rocket_launch',
    color: 'primary-fixed',
    tag: 'Open',
    tagBg: 'bg-primary-container text-on-primary-container',
    flow: 'open',
    wired: true,
    is_open_for_registration: false,
    desc: 'For founders and co-founders of early-stage startups (incorporated within the last 5 years).',
    features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
    cta: 'Register as Startup',
  },
  academic: {
    id: 'academic',
    title: 'Academic Pass',
    icon: 'school',
    color: 'secondary',
    tag: 'Approval',
    tagBg: 'bg-secondary-container text-on-secondary-container',
    flow: 'approval',
    wired: true,
    outline: true,
    desc: 'For professors, researchers, and staff from universities. Valid institutional credentials required for processing.',
    features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
    cta: 'Apply for Academic Pass',
  },
  student: {
    id: 'student',
    title: 'Student Pass',
    icon: 'person',
    color: 'primary-fixed',
    tag: 'Open',
    tagBg: 'bg-primary-container text-on-primary-container',
    flow: 'open',
    wired: true,
    is_open_for_registration: false,
    desc: 'For currently enrolled students from any educational institution. Valid student ID required at check-in desk.',
    features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
    cta: 'Register as Student',
  },
  volunteer: {
    id: 'volunteer',
    title: 'Volunteer',
    icon: 'volunteer_activism',
    color: 'primary-fixed',
    tag: 'Free',
    tagBg: 'bg-primary-container text-on-primary-container',
    flow: 'volunteer',
    wired: true,
    desc: 'Serve the Ummah Tech Fest team. Support workshops, guest experience, and creative media — no event ticket required.',
    features: ['Choose your pathways', 'One application per person', 'Certificate of appreciation'],
    cta: 'Apply to volunteer',
  },
  media: {
    id: 'media',
    title: 'Media Pass',
    icon: 'movie_filter',
    color: 'secondary',
    tag: 'Accreditation',
    tagBg: 'bg-secondary-container text-on-secondary-container',
    flow: 'approval',
    wired: false,
    outline: true,
    colSpan: 'lg:col-start-2',
    desc: 'For accredited journalists and media professionals from recognized local and international press organizations.',
    features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
    cta: 'Apply for Media Pass',
  },
}

/** Pass types shown on /signup in display order */
export const SIGNUP_PASS_ORDER = [
  'delegate', 'policy', 'investor', 'startup', 'academic', 'student', 'volunteer', 'media',
]

/** Registration steps not yet connected to backend */
export const GATED_STEPS = {
  verification: {
    title: 'Email verification',
    message: 'We are finishing secure email verification for pass holders. Your registration details are saved — we will notify you when this step opens.',
    icon: 'mark_email_read',
  },
  payment: {
    title: 'Payment',
    message: 'Online pass payment is coming soon. You can complete registration now; we will email you when payment is available.',
    icon: 'payments',
  },
}

export function getPass(id) {
  return PASSES[id] || null
}

export function getPassRegistrationPath(pass) {
  if (!pass?.wired) return null
  if (pass.flow === 'open' && pass.is_open_for_registration === false) return null
  if (pass.flow === 'volunteer') return '/volunteer/apply'
  // Open and approval passes start with a free account, then continue to details / application
  if (pass.flow === 'open' || pass.flow === 'approval') return `/create-account?pass=${pass.id}`
  return null
}
