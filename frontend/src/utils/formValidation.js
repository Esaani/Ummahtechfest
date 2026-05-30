const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return EMAIL_RE.test((email || '').trim())
}

export function validatePersonName(name, label = 'Name') {
  const v = (name || '').trim()
  if (v.length < 2) return `${label} must be at least 2 characters.`
  return ''
}

export function validateSponsorInquiry(form) {
  const errors = {}
  const nameErr = validatePersonName(form.full_name, 'Full name')
  if (nameErr) errors.full_name = nameErr
  if ((form.company_name || '').trim().length < 2) errors.company_name = 'Company name is required.'
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid work email.'
  return errors
}

export function validateWaitlist(form) {
  const errors = {}
  const nameErr = validatePersonName(form.full_name, 'Full name')
  if (nameErr) errors.full_name = nameErr
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.'
  return errors
}

export function validateSpeakerStep1(data) {
  const errors = {}
  const nameErr = validatePersonName(data.fullName, 'Full name')
  if (nameErr) errors.fullName = nameErr
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.'
  if (!data.roleKey) {
    errors.roleKey = 'Select the role that best describes you.'
  } else if (data.roleKey === 'other' && (data.roleCustom || '').trim().length < 2) {
    errors.roleKey = 'Please describe your role.'
  }
  if ((data.organization || '').trim().length < 2) errors.organization = 'Organization is required.'
  if ((data.bio || '').trim().length < 40) errors.bio = 'Bio must be at least 40 characters.'
  return errors
}

export function validateSpeakerStep2(data) {
  const errors = {}
  if ((data.sessionTitle || '').trim().length < 5) errors.sessionTitle = 'Session title is required.'
  if (!data.track) errors.track = 'Select a track.'
  if (!data.format) errors.format = 'Select a session format.'
  if ((data.abstract || '').trim().length < 80) errors.abstract = 'Abstract must be at least 80 characters.'
  if ((data.keyTakeaways || '').trim().length < 20) errors.keyTakeaways = 'List key takeaways for attendees.'
  return errors
}
