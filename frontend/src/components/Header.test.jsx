import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import Header from './Header.jsx'

vi.mock('../context/AuthContext', () => {
  return {
    useAuth: () => ({
      isAuthenticated: true,
      isAdminUser: true,
      logout: vi.fn(),
      user: { email: 'test@example.com', first_name: 'Test', last_name: 'User' },
    }),
  }
})

describe('Header (authenticated menu)', () => {
  it('shows account menu and opens dropdown', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    )

    const accountBtn = screen.getByRole('button', { name: /account menu/i })
    await user.click(accountBtn)

    expect(screen.getByRole('menu', { name: /account/i })).toBeInTheDocument()
    const menu = screen.getByRole('menu', { name: /account/i })
    expect(menu).toHaveTextContent(/registration status/i)
    expect(menu).toHaveTextContent(/volunteer status/i)
    expect(menu).toHaveTextContent(/cms/i)
    expect(within(menu).getByRole('menuitem', { name: /log out/i })).toBeInTheDocument()
  })
})

