import { getPassActionLabel, getPassAvailabilityLabel, isPassSignupBlocked } from '../utils/passHelpers'

const TONE_CLASS = {
  muted: 'text-on-surface-variant',
  pending: 'text-secondary-fixed font-bold',
  available: 'text-primary-fixed font-bold',
}

export default function PassSignupCard({ pass, index = 0, onSelect }) {
  const availability = getPassAvailabilityLabel(pass)
  const actionLabel = getPassActionLabel(pass)
  const dimmed = isPassSignupBlocked(pass)

  return (
    <div
      className={`glass-card p-8 rounded-xl flex flex-col justify-between transition-all duration-300 group hover:border-primary-fixed/40 hover:shadow-[0_0_20px_rgba(163,250,1,0.1)] ${pass.colSpan || ''}`}
      data-aos="fade-up"
      data-aos-delay={index * 50}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-lg bg-${pass.color}/10 text-${pass.color}`}>
            <span className="material-symbols-outlined">{pass.icon}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`${pass.tagBg} label-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}
            >
              {pass.tag}
            </span>
            <span
              className={`text-[10px] uppercase tracking-widest ${TONE_CLASS[availability.tone] || TONE_CLASS.muted}`}
            >
              {availability.label}
            </span>
          </div>
        </div>
        <h3 className={`headline-md mb-4 text-${pass.color}`}>{pass.title}</h3>
        <p className="body-md text-on-surface-variant mb-8">{pass.desc}</p>
        <ul className="space-y-4 mb-10">
          {pass.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3 text-on-surface">
              <span className={`material-symbols-outlined text-${pass.color} text-sm`}>check_circle</span>
              <span className="label-md">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => onSelect(pass)}
        className={`w-full py-4 rounded-lg label-md font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center ${
          pass.outline
            ? `border-2 border-${pass.color} text-${pass.color} hover:bg-${pass.color} hover:text-on-${pass.color}`
            : `bg-${pass.color} text-on-${pass.color} hover:shadow-[0_0_20px_rgba(163,250,1,0.4)]`
        } ${dimmed ? 'opacity-80' : ''}`}
      >
        {actionLabel}
      </button>
    </div>
  )
}
