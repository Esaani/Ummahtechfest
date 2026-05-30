import { getPageByPath } from '../config/pages'
import PageComingSoon from './PageComingSoon.jsx'

/**
 * Renders children when the page is live; otherwise shows Coming Soon.
 */
export default function GatedPage({ path, children }) {
  const page = getPageByPath(path)
  if (page && page.live === false) {
    return <PageComingSoon page={page} />
  }
  return children
}
