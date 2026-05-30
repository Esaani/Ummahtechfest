import { useMemo, useState } from 'react'
import AdminFormSelect from './AdminFormSelect.jsx'
import { presetsForBenefitRow } from '../../config/sponsorshipBenefitFields'

const CUSTOM = '__custom__'

const inputClass =
  'w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30 body-md'

export default function SponsorshipBenefitField({ rowKey, rowLabel, value, onChange }) {
  const presets = useMemo(() => presetsForBenefitRow(rowKey), [rowKey])
  const [useCustom, setUseCustom] = useState(() => {
    if (!presets?.length) return true
    if (!value) return false
    return !presets.includes(value)
  })

  if (!presets?.length) {
    return (
      <label className="block">
        <span className="label-md text-on-surface-variant mb-1 block">{rowLabel}</span>
        <input
          className={inputClass}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What should appear in this column?"
        />
      </label>
    )
  }

  const selectValue = useCustom ? CUSTOM : (value || '')

  return (
    <div className="space-y-2">
      <AdminFormSelect
        label={rowLabel}
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value
          if (next === CUSTOM) {
            setUseCustom(true)
            onChange('')
          } else {
            setUseCustom(false)
            onChange(next)
          }
        }}
        options={[
          { value: '', label: 'Choose an option…' },
          ...presets.map((p) => ({ value: p, label: p })),
          { value: CUSTOM, label: 'Other (type my own)' },
        ]}
      />
      {useCustom && (
        <input
          className={inputClass}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type exactly what should show in the table"
          aria-label={`${rowLabel} — custom value`}
        />
      )}
    </div>
  )
}
