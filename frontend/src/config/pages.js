/**
 * Page availability during phased development.
 * Set live: false to show the branded Coming Soon page at that route.
 */
export const PAGES = {
  home: {
    path: '/',
    title: 'Home',
    live: true,
  },
  sponsor: {
    path: '/sponsor',
    title: 'Sponsor',
    live: true,
  },
  volunteer: {
    path: '/volunteer',
    title: 'Volunteer',
    live: true,
  },
  register: {
    path: '/register',
    title: 'Register',
    live: true,
  },
  signup: {
    path: '/signup',
    title: 'Passes & registration',
    live: false,
    icon: 'confirmation_number',
    headline: 'Event passes',
    message:
      'Delegate, startup, and special-access passes are not open yet. You can apply to speak or volunteer while we finish the full registration portal.',
    relatedLinks: [
      { to: '/create-account', label: 'Register' },
      { to: '/volunteer', label: 'Volunteer program' },
    ],
  },
  ghana2026: {
    path: '/ghana-2026',
    title: 'Ghana 2026',
    live: false,
    icon: 'flag',
    headline: 'Ghana 2026',
    message:
      'We are crafting the full Accra experience — venue guides, travel tips, and heritage highlights. Check back soon.',
    relatedLinks: [
      { to: '/create-account', label: 'Register' },
      { to: '/volunteer', label: 'Volunteer program' },
    ],
  },
  schedule: {
    path: '/schedule',
    title: 'Schedule',
    live: false,
    icon: 'calendar_month',
    headline: 'Event schedule',
    message:
      'The full three-day agenda, sessions, and workshops are being finalized. We will publish the timetable shortly.',
    relatedLinks: [
      { to: '/volunteer', label: 'Volunteer program' },
      { to: '/create-account', label: 'Register' },
    ],
  },
  tickets: {
    path: '/tickets',
    title: 'Tickets',
    live: false,
    icon: 'confirmation_number',
    headline: 'Tickets & passes',
    message:
      'Pass sales and pricing tiers are almost ready. Register now to secure your interest — full ticketing opens soon.',
    relatedLinks: [
      { to: '/volunteer', label: 'Volunteer program' },
      { to: '/sponsor', label: 'Become a sponsor' },
    ],
  },
}

/** Lookup by route path */
export const PAGES_BY_PATH = Object.fromEntries(
  Object.values(PAGES).map((p) => [p.path, p]),
)

export function isPageLive(path) {
  const page = PAGES_BY_PATH[path]
  if (!page) return true
  return page.live !== false
}

export function getPageByPath(path) {
  return PAGES_BY_PATH[path]
}
