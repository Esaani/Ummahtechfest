import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError, apiRequest } from './client'

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.clear()
  })

  it('throws ApiError with sanitized message on failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { code: 'VALIDATION_ERROR', message: 'Please check your input.', details: {} },
      }),
    })
    await expect(apiRequest('/test/')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Please check your input.',
    })
  })

  it('sanitizes internal payment configuration errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { code: 'PAYMENT_INIT_FAILED', message: 'Paystack is not configured.' },
      }),
    })
    await expect(apiRequest('/payments/donations/')).rejects.toMatchObject({
      code: 'PAYMENT_INIT_FAILED',
      message: 'We could not process your payment right now. Please try again later.',
    })
  })

  it('attaches bearer token when present', async () => {
    localStorage.setItem('access_token', 'tok123')
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: {} }) })
    await apiRequest('/auth/me/')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me/'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok123' }),
      }),
    )
  })
})
