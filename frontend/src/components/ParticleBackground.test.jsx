import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import ParticleBackground from './ParticleBackground'

beforeAll(() => {
  // jsdom does not implement matchMedia
  window.matchMedia = window.matchMedia || vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })

  // jsdom canvas has no real 2d context
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
  })
})

afterEach(cleanup)

describe('ParticleBackground', () => {
  it('renders a canvas element', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('canvas is fixed position and non-interactive', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas.style.position).toBe('fixed')
    expect(canvas.style.pointerEvents).toBe('none')
  })

  it('canvas has aria-hidden for accessibility', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
  })

  it('unmounts without errors', () => {
    const { unmount } = render(<ParticleBackground />)
    expect(() => unmount()).not.toThrow()
  })
})
