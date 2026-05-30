import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Volunteer from './Volunteer'
import { AuthProvider } from '../context/AuthContext'

vi.mock('../api/client', () => ({
  volunteerApi: {
    eligibility: vi.fn().mockResolvedValue({ data: { can_apply: true, has_application: false } }),
  },
}))

function renderVolunteer() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Volunteer />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Volunteer page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders program overview and apply CTA when not signed in', () => {
    renderVolunteer()
    expect(screen.getByRole('heading', { name: /volunteer program/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /apply now/i })).toHaveAttribute('href', '/volunteer/apply')
  })
})
