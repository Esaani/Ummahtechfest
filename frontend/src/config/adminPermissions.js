/** Must match backend common.admin_roles permission keys */

export const PERM_CMS_MANAGE = 'cms.manage'
export const PERM_SUBMISSIONS_MANAGE = 'submissions.manage'
export const PERM_USERS_MANAGE = 'users.manage'

export const ADMIN_ROLES = [
  { value: 'content_manager', label: 'Content manager' },
  { value: 'submissions_reviewer', label: 'Submissions reviewer' },
  { value: 'user_manager', label: 'User manager' },
  { value: 'operations', label: 'Operations (content + submissions)' },
]

export const ADMIN_NAV = [
  { to: '/admin', end: true, icon: 'dashboard', label: 'Dashboard', permission: null },
  { to: '/admin/home', icon: 'home', label: 'Homepage', permission: PERM_CMS_MANAGE },
  { to: '/admin/speakers', icon: 'record_voice_over', label: 'Speakers', permission: PERM_CMS_MANAGE },
  { to: '/admin/sponsors', icon: 'handshake', label: 'Sponsors', permission: PERM_CMS_MANAGE },
  { to: '/admin/passes', icon: 'confirmation_number', label: 'Passes', permission: PERM_CMS_MANAGE },
  { to: '/admin/schedule', icon: 'calendar_month', label: 'Schedule', permission: PERM_CMS_MANAGE },
  { to: '/admin/submissions', icon: 'inbox', label: 'Submissions', permission: PERM_SUBMISSIONS_MANAGE },
  { to: '/admin/users', icon: 'group', label: 'Team & roles', permission: PERM_USERS_MANAGE },
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
    to: '/admin/users',
    icon: 'group',
    title: 'Team & roles',
    text: 'Invite staff, assign roles, and control who can access each admin area.',
    permission: PERM_USERS_MANAGE,
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
