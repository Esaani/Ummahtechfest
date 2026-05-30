/** Normalize API pass-type row for signup / gates / banners. */

/** Why signup is blocked — drives user-facing copy (not developer jargon). */
export const SIGNUP_BLOCKED = {
  TICKETS_NOT_ON_SALE: 'tickets_not_on_sale',
  NOT_LAUNCHED: 'not_launched',
}

function blockedCopy(flow, reason) {
  if (reason === SIGNUP_BLOCKED.TICKETS_NOT_ON_SALE) {
    return {
      title: 'Tickets not on sale yet',
      message:
        'We’re not selling tickets for this pass yet. Join the waitlist and we’ll email you when registration opens—you can still apply for other passes that are open now.',
    }
  }
  if (reason === SIGNUP_BLOCKED.NOT_LAUNCHED) {
    if (flow === 'volunteer') {
      return {
        title: 'Applications not open yet',
        message:
          'Volunteer sign-up for this program isn’t open yet. Please check back closer to the event, or choose another way to attend.',
      }
    }
    if (flow === 'approval') {
      return {
        title: 'Applications not open yet',
        message:
          'This pass isn’t accepting applications yet. Please choose another pass or check back soon.',
      }
    }
    return {
      title: 'Coming soon',
      message:
        'This pass isn’t open for registration yet. Please choose another pass or check back closer to the event.',
    }
  }
  return { title: null, message: null }
}

/** Status line under the pass tag (all pass types). */
export function getPassAvailabilityLabel(pass) {
  if (!pass) return { label: '', tone: 'muted' }
  if (pass.signupBlockedReason === SIGNUP_BLOCKED.NOT_LAUNCHED) {
    return { label: 'Coming soon', tone: 'muted' }
  }
  if (pass.signupBlockedReason === SIGNUP_BLOCKED.TICKETS_NOT_ON_SALE) {
    return { label: 'Not on sale yet', tone: 'pending' }
  }
  if (pass.flow === 'approval') return { label: 'Apply now', tone: 'available' }
  if (pass.flow === 'volunteer') return { label: 'Apply now', tone: 'available' }
  return { label: 'Available now', tone: 'available' }
}

/** Primary button label on pass card (all pass types). */
export function getPassActionLabel(pass) {
  if (!pass) return ''
  if (pass.signupBlockedReason === SIGNUP_BLOCKED.NOT_LAUNCHED) return 'Coming soon'
  if (pass.signupBlockedReason === SIGNUP_BLOCKED.TICKETS_NOT_ON_SALE) return 'Not on sale yet'
  return pass.cta
}

export function isPassSignupBlocked(pass) {
  return Boolean(pass?.signupBlockedReason)
}

export function mapPassTypeFromApi(pt) {
  if (!pt) return null
  const wired = (pt.wired ?? pt.is_wired) !== false
  const ticketsNotOnSale = pt.flow === 'open' && pt.is_open_for_registration === false

  let signupBlockedReason = null
  if (!wired) signupBlockedReason = SIGNUP_BLOCKED.NOT_LAUNCHED
  else if (ticketsNotOnSale) signupBlockedReason = SIGNUP_BLOCKED.TICKETS_NOT_ON_SALE

  const copy = blockedCopy(pt.flow, signupBlockedReason)

  const tag =
    pt.tag ||
    (pt.flow === 'open' ? 'Open' : pt.flow === 'volunteer' ? 'Free' : 'Approval')

  return {
    id: pt.slug,
    slug: pt.slug,
    title: pt.name,
    name: pt.name,
    desc: pt.description,
    description: pt.description,
    icon: pt.icon || 'badge',
    color: pt.display_color || pt.color || 'primary-fixed',
    tag,
    tagBg:
      tag === 'Open' || tag === 'Free'
        ? 'bg-primary-container text-on-primary-container'
        : 'bg-secondary-container text-on-secondary-container',
    flow: pt.flow,
    wired,
    is_open_for_registration: pt.is_open_for_registration !== false,
    outline: pt.is_outline_style ?? pt.outline,
    features: Array.isArray(pt.features) ? pt.features : [],
    cta:
      pt.cta ||
      pt.cta_label ||
      (pt.flow === 'open'
        ? `Register — ${pt.name}`
        : pt.flow === 'volunteer'
          ? 'Apply to volunteer'
          : `Apply — ${pt.name}`),
    colSpan: pt.colSpan,
    signupBlockedReason,
    comingSoonTitle: copy.title || pt.comingSoonTitle,
    comingSoonMessage: copy.message || pt.comingSoonMessage,
  }
}

/** Apply signup labels and blocked state to static `config/passes` entries. */
export function mapPassFromConfig(pass) {
  if (!pass) return null
  return mapPassTypeFromApi({
    slug: pass.id,
    name: pass.title,
    description: pass.desc,
    flow: pass.flow,
    icon: pass.icon,
    color: pass.color,
    tag: pass.tag,
    features: pass.features,
    cta: pass.cta,
    cta_label: pass.cta,
    wired: pass.wired,
    is_wired: pass.wired,
    is_open_for_registration: pass.is_open_for_registration ?? (pass.flow !== 'open'),
    is_outline_style: pass.outline,
    outline: pass.outline,
    colSpan: pass.colSpan,
  })
}
