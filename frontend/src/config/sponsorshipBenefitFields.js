/**
 * Suggested answers for each row on the sponsor comparison table.
 * Admins pick from a list or choose "Other" to type their own text.
 * Unknown row keys fall back to a simple text field.
 */

export const SPONSORSHIP_BENEFIT_PRESETS = {
  exhibition_booth: [
    '3×3m standard booth',
    '6×3m premium booth',
    '9×6m custom island',
    'No booth',
  ],
  speaking_slot: [
    'Not included',
    '15 min keynote',
    '30 min + panel',
    'Fireside chat',
  ],
  logo_placement: [
    'Marketing materials',
    'Premium placements',
    'Primary event branding',
    'Website only',
  ],
  vip_tickets: ['None', '2', '5', '10', '15'],
  talent_access: ['Not included', 'Included'],
}

export function presetsForBenefitRow(rowKey) {
  return SPONSORSHIP_BENEFIT_PRESETS[rowKey] || null
}

export function slugifyTierName(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
