import { describe, expect, it } from 'vitest'
import { GATED_STEPS, PASSES, getPass, getPassRegistrationPath } from './passes'

describe('passes config', () => {
  it('marks open and approval passes as wired', () => {
    expect(PASSES.delegate.wired).toBe(true)
    expect(PASSES.policy.wired).toBe(true)
    expect(PASSES.volunteer.flow).toBe('volunteer')
  })

  it('routes open passes through create-account when tickets are on sale', () => {
    expect(
      getPassRegistrationPath({ ...PASSES.delegate, is_open_for_registration: true }),
    ).toBe('/create-account?pass=delegate')
    expect(getPassRegistrationPath(PASSES.delegate)).toBeNull()
  })

  it('gates verification and payment steps', () => {
    expect(GATED_STEPS.verification.message).toMatch(/verification/i)
    expect(GATED_STEPS.payment.message).toMatch(/payment/i)
  })

  it('returns null for unknown pass', () => {
    expect(getPass('unknown')).toBeNull()
  })
})
