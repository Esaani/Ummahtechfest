/** Must match backend common.admin_roles permission keys */

export const PERM_CMS_MANAGE = 'cms.manage'
export const PERM_SUBMISSIONS_MANAGE = 'submissions.manage'
export const PERM_USERS_MANAGE = 'users.manage'
export const PERM_FINANCE_MANAGE = 'finance.manage'

export const ADMIN_ROLES = [
  { value: 'content_manager', label: 'Content manager' },
  { value: 'submissions_reviewer', label: 'Submissions reviewer' },
  { value: 'user_manager', label: 'User manager' },
  { value: 'operations', label: 'Operations (content + submissions)' },
  { value: 'finance', label: 'Finance manager' },
]

export const ADMIN_NAV = [
  { to: '/admin', end: true, icon: 'dashboard', label: 'Dashboard', permission: null },
  { to: '/admin/home', icon: 'home', label: 'Homepage', permission: PERM_CMS_MANAGE },
  { to: '/admin/voices', icon: 'campaign', label: 'Attendee Voices', permission: PERM_CMS_MANAGE },
  { to: '/admin/speakers', icon: 'record_voice_over', label: 'Speakers', permission: PERM_CMS_MANAGE },
  { to: '/admin/sponsors', icon: 'handshake', label: 'Sponsors', permission: PERM_CMS_MANAGE },
  { to: '/admin/passes', icon: 'confirmation_number', label: 'Passes', permission: PERM_CMS_MANAGE },
  { to: '/admin/schedule', icon: 'calendar_month', label: 'Schedule', permission: PERM_CMS_MANAGE },
  { to: '/admin/submissions', icon: 'inbox', label: 'Submissions', permission: PERM_SUBMISSIONS_MANAGE },
  { to: '/admin/volunteer-portal', icon: 'volunteer_activism', label: 'Volunteer Portal', permission: PERM_SUBMISSIONS_MANAGE },
  { to: '/admin/donations', icon: 'payments', label: 'Donations', permission: PERM_SUBMISSIONS_MANAGE },
  { to: '/admin/users', icon: 'group', label: 'Team & roles', permission: PERM_USERS_MANAGE },
  { to: '/admin/finance', icon: 'account_balance', label: 'Finance', permission: PERM_FINANCE_MANAGE, end: true },
  { to: '/admin/finance/overview', icon: 'monitoring', label: 'Overview', permission: PERM_FINANCE_MANAGE, isSubItem: true },
  { to: '/admin/finance/wallets', icon: 'account_balance_wallet', label: 'Balances & Wallets', permission: PERM_FINANCE_MANAGE, isSubItem: true },
  { to: '/admin/finance/transactions', icon: 'receipt_long', label: 'Transactions', permission: PERM_FINANCE_MANAGE, isSubItem: true },
  { to: '/admin/finance/bills-expenses', icon: 'payments', label: 'Bills & Expenses', permission: PERM_FINANCE_MANAGE, isSubItem: true },
]

export const ADMIN_DASHBOARD_CARDS = [
  {
    to: '/admin/home',
    icon: 'home',
    title: 'Homepage',
    text: 'Hero video, poster, and Why we build images (stored in media / R2).',
    permission: PERM_CMS_MANAGE,
  },
  {
    to: '/admin/voices',
    icon: 'campaign',
    title: 'Attendee Voices',
    text: 'Manage testimonials and feedback from past attendees to display on the site.',
    permission: PERM_CMS_MANAGE,
  },
  {
    to: '/admin/speakers',
    icon: 'record_voice_over',
    title: 'Featured speakers',
    text: 'Upload photos and manage who appears in the homepage speakers section.',
    permission: PERM_CMS_MANAGE,
  },
  {
    to: '/admin/sponsors',
    icon: 'handshake',
    title: 'Sponsors',
    text: 'Sponsorship tiers for the sponsor page and homepage logo marquee.',
    permission: PERM_CMS_MANAGE,
  },
  {
    to: '/admin/passes',
    icon: 'confirmation_number',
    title: 'Event passes',
    text: 'Signup pass cards — copy, icons, and whether each pass is live or coming soon.',
    permission: PERM_CMS_MANAGE,
  },
  {
    to: '/admin/schedule',
    icon: 'calendar_month',
    title: 'Event schedule',
    text: 'Homepage agenda preview and full schedule page sessions.',
    permission: PERM_CMS_MANAGE,
  },
  {
    to: '/admin/submissions',
    icon: 'inbox',
    title: 'Submissions',
    text: 'Sponsor inquiries, speaker applications, ticket waitlist, and volunteer applications.',
    permission: PERM_SUBMISSIONS_MANAGE,
  },
  {
    to: '/admin/volunteer-portal',
    icon: 'volunteer_activism',
    title: 'Volunteer Portal',
    text: 'Assign tasks and post announcements to accepted volunteers.',
    permission: PERM_SUBMISSIONS_MANAGE,
  },
  {
    to: '/admin/donations',
    icon: 'payments',
    title: 'Donations',
    text: 'Review donor details, amounts, payment status, and messages.',
    permission: PERM_SUBMISSIONS_MANAGE,
  },
  {
    to: '/admin/users',
    icon: 'group',
    title: 'Team & roles',
    text: 'Invite staff, assign roles, and control who can access each admin area.',
    permission: PERM_USERS_MANAGE,
  },
  {
    to: '/admin/finance',
    icon: 'account_balance',
    title: 'Finance',
    text: 'Manage and request financial withdrawals and cash outs.',
    permission: PERM_FINANCE_MANAGE,
  },
]

export function userHasAdminPermission(user, permission) {
  if (!user) return false
  if (user.is_superuser) return true
  const perms = user.admin_permissions || []
  return perms.includes(permission)
}

export function userCanAccessAdminPortal(user) {
  if (!user) return false
  if (user.is_superuser) return true
  return (user.admin_permissions || []).length > 0
}

export function filterByPermission(items, user) {
  return items.filter((item) => !item.permission || userHasAdminPermission(user, item.permission))
}
