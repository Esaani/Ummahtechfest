/** Hidden field bots fill; leave empty for humans. */
export default function HoneypotField({ value, onChange }) {
  return (
    <div
      className="absolute -left-[9999px] w-px h-px overflow-hidden"
      aria-hidden="true"
      tabIndex={-1}
    >
      <label htmlFor="website">Website</label>
      <input
        type="text"
        id="website"
        name="website"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
