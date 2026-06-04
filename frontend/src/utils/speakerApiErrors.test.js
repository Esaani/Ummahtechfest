import { describe, expect, it } from 'vitest'
import { firstSpeakerApiErrorMessage, mapSpeakerApiErrors, speakerErrorStep } from './speakerApiErrors'

describe('speakerApiErrors', () => {
  it('maps API field keys to form keys', () => {
    const mapped = mapSpeakerApiErrors({
      profile_photo: ['Profile photo must be an image file.'],
      linkedin_url: ['Enter a valid URL or leave this field empty.'],
    })
    expect(mapped.profilePhoto).toMatch(/image/i)
    expect(mapped.linkedin).toMatch(/valid URL/i)
  })

  it('picks first error message for display', () => {
    const msg = firstSpeakerApiErrorMessage(
      { bio: ['Bio must be at least 40 characters.'] },
      'Please check your input and try again.',
    )
    expect(msg).toMatch(/bio/i)
  })

  it('routes linkedin errors to review step', () => {
    expect(speakerErrorStep({ linkedin: 'bad url' })).toBe(3)
    expect(speakerErrorStep({ profilePhoto: 'required' })).toBe(1)
  })
})
