export function FormField({ label, htmlFor, hint, error, required, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-on-surface">
        {label}
        {required && <span className="text-primary-fixed ml-0.5" aria-hidden="true">*</span>}
      </label>
      {hint && <p className="text-xs text-on-surface-variant leading-relaxed">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs text-error flex items-center gap-1" role="alert">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  )
}

export function formControlClass(hasError = false) {
  return [
    'form-control w-full rounded-xl border bg-surface-container-high/80 text-on-surface',
    'px-4 py-3 text-sm leading-relaxed placeholder:text-on-surface-variant/60',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-fixed/35 focus:border-primary-fixed/50',
    hasError ? 'border-error/50' : 'border-outline-variant/40 hover:border-outline-variant/60',
  ].join(' ')
}

export function FormInput({ id, hasError, className = '', ...props }) {
  return <input id={id} className={`${formControlClass(hasError)} ${className}`} {...props} />
}

export function FormTextarea({ id, hasError, className = '', rows = 4, ...props }) {
  return <textarea id={id} rows={rows} className={`${formControlClass(hasError)} resize-y min-h-[88px] ${className}`} {...props} />
}

export function FormSelect({ id, hasError, className = '', children, ...props }) {
  return (
    <div className="relative">
      <select id={id} className={`form-select ${formControlClass(hasError)} pr-11 ${className}`} {...props}>
        {children}
      </select>
      <span
        className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl"
        aria-hidden="true"
      >
        expand_more
      </span>
    </div>
  )
}
