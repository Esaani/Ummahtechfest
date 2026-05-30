/** Styled select for admin forms — consistent height and spacing. */

export default function AdminFormSelect({
  label,
  htmlFor,
  value,
  onChange,
  options,
  required,
  disabled,
  hint,
}) {
  return (
    <label className="block">
      {label && (
        <span className="label-md text-on-surface-variant mb-1 block">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
      )}
      <select
        id={htmlFor}
        className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30 body-md"
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="text-xs text-on-surface-variant mt-1 block">{hint}</span>}
    </label>
  )
}
