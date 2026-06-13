const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const PAYMENT_ERROR_CODES = new Set([
  'PAYMENT_UNAVAILABLE',
  'PAYMENT_INIT_FAILED',
  'VERIFY_FAILED',
])

const INTERNAL_ERROR_PATTERNS = [
  /not configured/i,
  /paystack/i,
  /webhook secret/i,
  /provider request failed/i,
  /sk_(live|test)_/i,
  /pk_(live|test)_/i,
]

function sanitizeClientErrorMessage(code, message) {
  const text = message || 'Something went wrong. Please try again.'
  if (PAYMENT_ERROR_CODES.has(code)) {
    return 'We could not process your payment right now. Please try again later.'
  }
  if (INTERNAL_ERROR_PATTERNS.some((pattern) => pattern.test(text))) {
    return 'Something went wrong. Please try again later.'
  }
  return text
}

export class ApiError extends Error {
  constructor(code, message, details) {
    super(message)
    this.code = code
    this.details = details
  }
}

async function parseResponse(response) {
  if (response.status === 204) return {}
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const err = body.error || {}
    throw new ApiError(
      err.code || 'UNKNOWN_ERROR',
      sanitizeClientErrorMessage(err.code, err.message),
      err.details,
    )
  }
  return body
}

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const headers = { ...(options.headers || {}) }
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const token = localStorage.getItem('access_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body
      ? (isFormData ? options.body : JSON.stringify(options.body))
      : undefined,
  })
  return parseResponse(response)
}

export const authApi = {
  sendSignupOtp: (data) => apiRequest('/auth/signup/verify-email/send/', { method: 'POST', body: data }),
  confirmSignupOtp: (data) => apiRequest('/auth/signup/verify-email/confirm/', { method: 'POST', body: data }),
  resendSignupOtp: (data) => apiRequest('/auth/signup/verify-email/resend/', { method: 'POST', body: data }),
  register: (data) => apiRequest('/auth/register/', { method: 'POST', body: data }),
  login: (data) => apiRequest('/auth/login/', { method: 'POST', body: data }),
  me: () => apiRequest('/auth/me/'),
  logout: (refresh) => apiRequest('/auth/logout/', { method: 'POST', body: { refresh } }),
  requestPasswordReset: (data) => apiRequest('/auth/password-reset/request/', { method: 'POST', body: data }),
  confirmPasswordReset: (data) => apiRequest('/auth/password-reset/confirm/', { method: 'POST', body: data }),
  acceptStaffInvite: (data) => apiRequest('/auth/staff-invite/accept/', { method: 'POST', body: data }),
  adminUsers: (staffOnly) =>
    apiRequest(`/auth/admin/users/${staffOnly ? '?staff=1' : ''}`),
  inviteAdminUser: (data) => apiRequest('/auth/admin/users/invite/', { method: 'POST', body: data }),
  inviteParticipant: (data) => apiRequest('/auth/admin/participants/invite/', { method: 'POST', body: data }),
  acceptParticipantInvite: (data) => apiRequest('/auth/participant-invite/accept/', { method: 'POST', body: data }),
  updateAdminUser: (id, data) => apiRequest(`/auth/admin/users/${id}/`, { method: 'PATCH', body: data }),
}

export const registrationsApi = {
  passTypes: () => apiRequest('/registrations/pass-types/'),
  adminPassTypes: () => apiRequest('/registrations/admin/pass-types/'),
  createPassType: (data) => apiRequest('/registrations/admin/pass-types/', { method: 'POST', body: data }),
  updatePassType: (id, data) => apiRequest(`/registrations/admin/pass-types/${id}/`, { method: 'PATCH', body: data }),
  deletePassType: (id) => apiRequest(`/registrations/admin/pass-types/${id}/`, { method: 'DELETE' }),
  me: () => apiRequest('/registrations/me/'),
  submitOpen: (data) => apiRequest('/registrations/open/', { method: 'POST', body: data }),
  submitSpecialAccess: (data) => apiRequest('/registrations/special-access/', { method: 'POST', body: data }),
  adminDashboardStats: () => apiRequest('/registrations/admin/dashboard/stats/'),
}

export const outreachApi = {
  options: () => apiRequest('/outreach/options/'),
  submitSponsorInquiry: (data) => apiRequest('/outreach/sponsor-inquiries/', { method: 'POST', body: data }),
  speakerApplicationMe: () => apiRequest('/outreach/speaker-applications/me/'),
  submitSpeakerApplication: (data) => apiRequest('/outreach/speaker-applications/', { method: 'POST', body: data }),
  submitTicketWaitlist: (data) => apiRequest('/outreach/ticket-waitlist/', { method: 'POST', body: data }),
  adminSponsorInquiries: (status) =>
    apiRequest(`/outreach/admin/sponsor-inquiries/${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateSponsorInquiry: (id, data) =>
    apiRequest(`/outreach/admin/sponsor-inquiries/${id}/`, { method: 'PATCH', body: data }),
  adminSpeakerApplications: (status) =>
    apiRequest(`/outreach/admin/speaker-applications/${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getSpeakerApplication: (id) => apiRequest(`/outreach/admin/speaker-applications/${id}/`),
  updateSpeakerApplication: (id, data) =>
    apiRequest(`/outreach/admin/speaker-applications/${id}/`, { method: 'PATCH', body: data }),
  adminTicketWaitlist: (status) =>
    apiRequest(`/outreach/admin/ticket-waitlist/${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateTicketWaitlist: (id, data) =>
    apiRequest(`/outreach/admin/ticket-waitlist/${id}/`, { method: 'PATCH', body: data }),
  subscribeNewsletter: (data) => apiRequest('/outreach/subscribe/', { method: 'POST', body: data }),
}

export const cmsApi = {
  publicSpeakers: () => apiRequest('/cms/speakers/'),
  publicSponsors: (tier) => apiRequest(`/cms/sponsors/${tier ? `?tier=${encodeURIComponent(tier)}` : ''}`),
  adminSpeakers: () => apiRequest('/cms/admin/speakers/'),
  createSpeaker: (data) => apiRequest('/cms/admin/speakers/', { method: 'POST', body: data }),
  updateSpeaker: (id, data) => apiRequest(`/cms/admin/speakers/${id}/`, { method: 'PATCH', body: data }),
  deleteSpeaker: (id) => apiRequest(`/cms/admin/speakers/${id}/`, { method: 'DELETE' }),
  adminSponsors: (tier) => apiRequest(`/cms/admin/sponsors/${tier ? `?tier=${encodeURIComponent(tier)}` : ''}`),
  createSponsor: (data) => apiRequest('/cms/admin/sponsors/', { method: 'POST', body: data }),
  updateSponsor: (id, data) => apiRequest(`/cms/admin/sponsors/${id}/`, { method: 'PATCH', body: data }),
  deleteSponsor: (id) => apiRequest(`/cms/admin/sponsors/${id}/`, { method: 'DELETE' }),
  publicSections: (page) => apiRequest(`/cms/sections/${page ? `?page=${encodeURIComponent(page)}` : ''}`),
  publicSection: (slug) => apiRequest(`/cms/sections/${slug}/`),
  adminSections: (page) => apiRequest(`/cms/admin/sections/${page ? `?page=${encodeURIComponent(page)}` : ''}`),
  getSection: (id) => apiRequest(`/cms/admin/sections/${id}/`),
  createSection: (data) => apiRequest('/cms/admin/sections/', { method: 'POST', body: data }),
  updateSection: (id, data) => apiRequest(`/cms/admin/sections/${id}/`, { method: 'PATCH', body: data }),
  deleteSection: (id) => apiRequest(`/cms/admin/sections/${id}/`, { method: 'DELETE' }),
  adminMedia: (folder) => apiRequest(`/cms/admin/media/${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`),
  uploadMedia: (formData) => apiRequest('/cms/admin/media/', { method: 'POST', body: formData }),
  deleteMedia: (id) => apiRequest(`/cms/admin/media/${id}/`, { method: 'DELETE' }),
  publicSponsorship: () => apiRequest('/cms/sponsorship/'),
  adminSponsorshipPackages: () => apiRequest('/cms/admin/sponsorship/packages/'),
  createSponsorshipPackage: (data) =>
    apiRequest('/cms/admin/sponsorship/packages/', { method: 'POST', body: data }),
  updateSponsorshipPackage: (id, data) =>
    apiRequest(`/cms/admin/sponsorship/packages/${id}/`, { method: 'PATCH', body: data }),
  deleteSponsorshipPackage: (id) =>
    apiRequest(`/cms/admin/sponsorship/packages/${id}/`, { method: 'DELETE' }),
  adminSponsorshipBenefitRows: () => apiRequest('/cms/admin/sponsorship/benefit-rows/'),
  createSponsorshipBenefitRow: (data) =>
    apiRequest('/cms/admin/sponsorship/benefit-rows/', { method: 'POST', body: data }),
  updateSponsorshipBenefitRow: (id, data) =>
    apiRequest(`/cms/admin/sponsorship/benefit-rows/${id}/`, { method: 'PATCH', body: data }),
  deleteSponsorshipBenefitRow: (id) =>
    apiRequest(`/cms/admin/sponsorship/benefit-rows/${id}/`, { method: 'DELETE' }),
  publicSchedule: (homeOnly) =>
    apiRequest(`/cms/schedule/${homeOnly ? '?home=1' : ''}`),
  adminSchedule: (day) =>
    apiRequest(`/cms/admin/schedule/${day ? `?day=${encodeURIComponent(day)}` : ''}`),
  createScheduleSession: (data) => apiRequest('/cms/admin/schedule/', { method: 'POST', body: data }),
  updateScheduleSession: (id, data) => apiRequest(`/cms/admin/schedule/${id}/`, { method: 'PATCH', body: data }),
  deleteScheduleSession: (id) => apiRequest(`/cms/admin/schedule/${id}/`, { method: 'DELETE' }),
}

export const paymentsApi = {
  initializePassPayment: () => apiRequest('/payments/initialize/', { method: 'POST', body: {} }),
  verify: (reference) => apiRequest(`/payments/verify/${encodeURIComponent(reference)}/`),
  donate: (data) => apiRequest('/payments/donations/', { method: 'POST', body: data }),
  adminWithdrawals: () => apiRequest('/payments/admin/withdrawals/'),
  createWithdrawal: (data) => apiRequest('/payments/admin/withdrawals/', { method: 'POST', body: data }),
  approveWithdrawal: (id, data) => apiRequest(`/payments/admin/withdrawals/${id}/approve/`, { method: 'POST', body: data }),
  
  // Finance Manager Endpoints
  financeOverview: () => apiRequest('/payments/admin/finance/overview/'),
  
  financeWallets: () => apiRequest('/payments/admin/finance/wallets/'),
  createWallet: (data) => apiRequest('/payments/admin/finance/wallets/', { method: 'POST', body: data }),
  updateWallet: (id, data) => apiRequest(`/payments/admin/finance/wallets/${id}/`, { method: 'PATCH', body: data }),
  deleteWallet: (id) => apiRequest(`/payments/admin/finance/wallets/${id}/`, { method: 'DELETE' }),

  financeBills: () => apiRequest('/payments/admin/finance/bills/'),
  createBill: (data) => apiRequest('/payments/admin/finance/bills/', { method: 'POST', body: data }),
  updateBill: (id, data) => apiRequest(`/payments/admin/finance/bills/${id}/`, { method: 'PATCH', body: data }),
  deleteBill: (id) => apiRequest(`/payments/admin/finance/bills/${id}/`, { method: 'DELETE' }),

  financeExpenses: () => apiRequest('/payments/admin/finance/expenses/'),
  createExpense: (data) => apiRequest('/payments/admin/finance/expenses/', { method: 'POST', body: data }),
  updateExpense: (id, data) => apiRequest(`/payments/admin/finance/expenses/${id}/`, { method: 'PATCH', body: data }),
  deleteExpense: (id) => apiRequest(`/payments/admin/finance/expenses/${id}/`, { method: 'DELETE' }),

  financeGoals: () => apiRequest('/payments/admin/finance/goals/'),
  createGoal: (data) => apiRequest('/payments/admin/finance/goals/', { method: 'POST', body: data }),
  updateGoal: (id, data) => apiRequest(`/payments/admin/finance/goals/${id}/`, { method: 'PATCH', body: data }),
  deleteGoal: (id) => apiRequest(`/payments/admin/finance/goals/${id}/`, { method: 'DELETE' }),
}

export const volunteerApi = {
  /** Volunteer pathway options (event support, creative media, etc.) */
  listPathways: () => apiRequest('/volunteers/roles/'),
  eligibility: () => apiRequest('/volunteers/applications/eligibility/'),
  submitApplication: (data) => apiRequest('/volunteers/applications/', { method: 'POST', body: data }),
  myApplication: () => apiRequest('/volunteers/applications/me/'),
  withdraw: () => apiRequest('/volunteers/applications/me/', { method: 'PATCH', body: {} }),
  adminApplications: (status) =>
    apiRequest(`/volunteers/admin/applications/${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getAdminApplication: (id) => apiRequest(`/volunteers/admin/applications/${id}/`),
  updateAdminApplication: (id, data) =>
    apiRequest(`/volunteers/admin/applications/${id}/`, { method: 'PATCH', body: data }),
  adminRoles: () => apiRequest('/volunteers/admin/roles/'),
}
