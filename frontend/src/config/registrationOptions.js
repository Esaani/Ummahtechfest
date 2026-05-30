/**
 * Canonical options for pass registration forms (reduces typo / duplicate titles).
 */

export const EXPERIENCE_YEAR_OPTIONS = [
  { value: '', label: 'Select years of experience' },
  { value: '0', label: 'Less than 1 year' },
  ...Array.from({ length: 19 }, (_, i) => {
    const n = i + 1
    return { value: String(n), label: `${n} year${n === 1 ? '' : 's'}` }
  }),
  { value: '20', label: '20 years or more' },
]

/** Values match what we persist as job_title unless user picks "Other". */
export const JOB_ROLE_OPTIONS = [
  { value: '', label: 'Select your role' },
  { value: 'Chief Executive Officer (CEO)', label: 'Chief Executive Officer (CEO)' },
  { value: 'Chief Technology Officer (CTO)', label: 'Chief Technology Officer (CTO)' },
  { value: 'Director / Head of department', label: 'Director / Head of department' },
  { value: 'Senior Manager', label: 'Senior Manager' },
  { value: 'Product Manager', label: 'Product Manager' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Software Engineer', label: 'Software Engineer' },
  { value: 'Data / ML Engineer', label: 'Data / ML Engineer' },
  { value: 'DevOps / SRE', label: 'DevOps / SRE' },
  { value: 'Designer (UX/UI)', label: 'Designer (UX/UI)' },
  { value: 'Quality Assurance (QA)', label: 'Quality Assurance (QA)' },
  { value: 'Analyst', label: 'Analyst' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'Researcher', label: 'Researcher' },
  { value: 'Student', label: 'Student' },
  { value: 'Founder / Co-founder', label: 'Founder / Co-founder' },
  { value: 'Investor', label: 'Investor' },
  { value: 'Policy / Government official', label: 'Policy / Government official' },
  { value: '__other__', label: 'Other (specify)' },
]

export const OTHER_JOB_ROLE_VALUE = '__other__'
