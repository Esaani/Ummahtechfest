import { describe, expect, it } from 'vitest'
import { PAGES, getPageByPath, isPageLive } from './pages'

describe('pages config', () => {
  it('keeps priority pages live', () => {
    expect(PAGES.home.live).toBe(true)
    expect(PAGES.sponsor.live).toBe(true)
    expect(PAGES.volunteer.live).toBe(true)
    expect(PAGES.applyToSpeak.live).toBe(true)
  })

  it('gates ghana, schedule, and tickets', () => {
    expect(isPageLive('/ghana-2026')).toBe(false)
    expect(isPageLive('/schedule')).toBe(false)
    expect(isPageLive('/tickets')).toBe(false)
  })

  it('returns page metadata by path', () => {
    expect(getPageByPath('/schedule')?.headline).toMatch(/schedule/i)
  })
})
