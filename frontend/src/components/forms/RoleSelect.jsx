import { useState } from 'react'
import ChoiceCards from './ChoiceCards'
import { FormField, FormInput } from './FormField'

export const SPEAKER_ROLE_OPTIONS = [
  { value: 'founder', label: 'Founder / Entrepreneur' },
  { value: 'executive', label: 'C-suite / Executive' },
  { value: 'engineering', label: 'Engineering & Product' },
  { value: 'design', label: 'Design & Creative' },
  { value: 'research', label: 'Research & Academia' },
  { value: 'community', label: 'Community & Non-profit' },
  { value: 'student', label: 'Student' },
  { value: 'other', label: 'Other' },
]

export function roleToProfessionalTitle(roleKey, customText) {
  if (roleKey === 'other') return (customText || '').trim()
  return SPEAKER_ROLE_OPTIONS.find((r) => r.value === roleKey)?.label || ''
}

/**
 * Role picker — not a free-text "title" field. Maps to API professional_title.
 */
export default function RoleSelect({ roleKey, customRole, onRoleChange, onCustomChange, error }) {
  const [showCustom, setShowCustom] = useState(roleKey === 'other')

  const handleRole = (value) => {
    onRoleChange(value)
    setShowCustom(value === 'other')
    if (value !== 'other') onCustomChange('')
  }

  return (
    <div className="space-y-4 md:col-span-2">
      <FormField
        label="Your role"
        htmlFor="role-other"
        hint="How you would be introduced on stage — pick the closest match."
        error={error && !showCustom ? error : ''}
        required
      >
        <ChoiceCards
          name="Speaker role"
          value={roleKey}
          onChange={handleRole}
          options={SPEAKER_ROLE_OPTIONS}
          columns={2}
          size="compact"
        />
      </FormField>
      {showCustom && (
        <FormField label="Describe your role" htmlFor="role-other" error={showCustom ? error : ''} required>
          <FormInput
            id="role-other"
            value={customRole}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="e.g. Head of Developer Relations"
            hasError={!!error}
          />
        </FormField>
      )}
    </div>
  )
}
