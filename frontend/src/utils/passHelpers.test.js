import { describe, expect, it } from 'vitest'
import { PASSES } from '../config/passes'
import {
  SIGNUP_BLOCKED,
  getPassActionLabel,
  getPassAvailabilityLabel,
  mapPassFromConfig,
  mapPassTypeFromApi,
} from './passHelpers'

describe('passHelpers', () => {
  it('marks open seeded passes as tickets not on sale', () => {
    const delegate = mapPassFromConfig(PASSES.delegate)
    expect(delegate.signupBlockedReason).toBe(SIGNUP_BLOCKED.TICKETS_NOT_ON_SALE)
    expect(getPassAvailabilityLabel(delegate).label).toBe('Not on sale yet')
    expect(getPassActionLabel(delegate)).toBe('Not on sale yet')
  })

  it('marks approval passes as apply now when live', () => {
    const policy = mapPassFromConfig(PASSES.policy)
    expect(policy.signupBlockedReason).toBeNull()
    expect(getPassAvailabilityLabel(policy).label).toBe('Apply now')
    expect(getPassActionLabel(policy)).toBe('Apply for Policy Pass')
  })

  it('marks unwired media pass as coming soon', () => {
    const media = mapPassFromConfig(PASSES.media)
    expect(media.signupBlockedReason).toBe(SIGNUP_BLOCKED.NOT_LAUNCHED)
    expect(getPassAvailabilityLabel(media).label).toBe('Coming soon')
    expect(media.comingSoonMessage).toMatch(/applications/i)
  })

  it('volunteer blocked copy is specific', () => {
    const vol = mapPassTypeFromApi({
      slug: 'volunteer',
      name: 'Volunteer',
      flow: 'volunteer',
      is_wired: false,
    })
    expect(vol.comingSoonMessage).toMatch(/Volunteer/i)
  })
})
