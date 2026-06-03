import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DonationWidget from './DonationWidget.jsx'

vi.mock('../api/client', () => ({
  paymentsApi: { donate: vi.fn() },
  ApiError: class ApiError extends Error {},
}))

describe('DonationWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders preset amounts and donate button', () => {
    render(<DonationWidget />)
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /complete donation/i })).toBeInTheDocument()
  })

  it('allows selecting a preset amount', async () => {
    const user = userEvent.setup()
    render(<DonationWidget />)
    const textElement = screen.getByText('100')
    const preset = textElement.closest('button')
    await user.click(preset)
    expect(preset).toHaveClass('bg-primary-fixed')
  })

  it('shows validation when submitting empty form', async () => {
    const user = userEvent.setup()
    render(<DonationWidget />)
    await user.click(screen.getByRole('button', { name: /complete donation/i }))
    expect(await screen.findByText(/enter your name/i)).toBeInTheDocument()
  })
})
