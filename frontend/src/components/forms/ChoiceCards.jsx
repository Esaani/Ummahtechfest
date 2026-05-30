/**
 * Accessible single-select option cards (replaces unstyled native dropdowns).
 */
export default function ChoiceCards({
  name,
  value,
  onChange,
  options,
  error,
  columns = 2,
  size = 'default',
}) {
  const gridClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2'

  const pad = size === 'compact' ? 'p-3' : 'p-4'

  return (
    <div>
      <div className={`grid ${gridClass} gap-3`} role="radiogroup" aria-label={name} aria-invalid={!!error}>
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={[
                `${pad} rounded-xl border text-left transition-all duration-200`,
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed/40',
                selected
                  ? 'border-primary-fixed/60 bg-primary-fixed/10 shadow-[inset_0_0_0_1px_rgba(163,250,1,0.25)]'
                  : 'border-outline-variant/35 bg-surface-container-high/40 hover:border-outline-variant/55 hover:bg-surface-container-high/70',
              ].join(' ')}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="block text-sm font-semibold text-on-surface leading-snug">{opt.label}</span>
                <span
                  className={[
                    'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
                    selected ? 'border-primary-fixed bg-primary-fixed' : 'border-outline-variant/50',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {selected && (
                    <span className="material-symbols-outlined text-on-primary-fixed text-[14px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  )}
                </span>
              </span>
              {opt.description && (
                <span className="block text-xs text-on-surface-variant mt-2 leading-relaxed">{opt.description}</span>
              )}
            </button>
          )
        })}
      </div>
      {error && (
        <p className="text-xs text-error mt-2 flex items-center gap-1" role="alert">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
