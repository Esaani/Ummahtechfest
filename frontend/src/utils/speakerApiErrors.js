/** Map API field keys to ApplyToSpeak form state keys. */
export const SPEAKER_API_FIELD_MAP = {
  full_name: 'fullName',
  email: 'email',
  occupation: 'occupation',
  role: 'role',
  professional_title: 'roleKey',
  organization: 'organization',
  bio: 'bio',
  profile_photo: 'profilePhoto',
  cv: 'cv',
  linkedin_url: 'linkedin',
  twitter_handle: 'twitter',
  session_title: 'sessionTitle',
  track: 'track',
  session_format: 'format',
  abstract: 'abstract',
  key_takeaways: 'keyTakeaways',
  tech_requirements: 'techRequirements',
  co_speakers: 'coSpeakers',
  website: 'honeypot',
}

export function mapSpeakerApiErrors(details) {
  if (!details || typeof details !== 'object') return {}
  const mapped = {}
  for (const [key, msgs] of Object.entries(details)) {
    const formKey = SPEAKER_API_FIELD_MAP[key] || key
    const text = Array.isArray(msgs) ? msgs[0] : String(msgs)
    mapped[formKey] = text
  }
  return mapped
}

export function firstSpeakerApiErrorMessage(details, fallback) {
  const mapped = mapSpeakerApiErrors(details)
  const first = Object.values(mapped)[0]
  return first || fallback
}

/** Which wizard step owns this form field (for jumping back on API errors). */
export function speakerErrorStep(fieldErrors) {
  const step1Keys = ['fullName', 'email', 'roleKey', 'organization', 'occupation', 'role', 'bio', 'profilePhoto', 'cv']
  const step2Keys = ['sessionTitle', 'track', 'format', 'abstract', 'keyTakeaways']
  if (step1Keys.some((k) => fieldErrors[k])) return 1
  if (step2Keys.some((k) => fieldErrors[k])) return 2
  if (fieldErrors.linkedin || fieldErrors.twitter || fieldErrors.techRequirements || fieldErrors.coSpeakers) {
    return 3
  }
  return 3
}
