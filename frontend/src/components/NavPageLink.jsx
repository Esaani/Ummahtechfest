import { Link } from 'react-router-dom'
import { getPageByPath, isPageLive } from '../config/pages'

/**
 * Nav link with optional "Soon" badge for gated pages.
 */
export default function NavPageLink({ to, className, children, onClick }) {
  const live = isPageLive(to)
  const page = getPageByPath(to)

  return (
    <Link
      to={to}
      onClick={onClick}
      className={className}
      title={!live && page?.title ? `${page.title} — coming soon` : undefined}
    >
      {children}
      {!live && (
        <span className="ml-1 inline-block px-1 py-px rounded text-[7px] xl:text-[8px] font-black uppercase tracking-wider bg-secondary/20 text-secondary align-middle leading-none">
          Soon
        </span>
      )}
    </Link>
  )
}
