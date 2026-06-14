import { useEffect, useMemo, useState } from 'react'
import { ApiError, paymentsApi } from '../../api/client'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'success', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'abandoned', label: 'Abandoned' },
]

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function formatMoney(amount, currency = 'GHS') {
  const value = Number(amount)
  if (!Number.isFinite(value)) return `${currency} ${amount || '0.00'}`
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).format(value)
}

function statusClass(status) {
  if (status === 'success') return 'bg-primary-fixed/15 text-primary-fixed border-primary-fixed/30'
  if (status === 'failed') return 'bg-error/10 text-error border-error/20'
  return 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
}

export default function AdminDonations() {
  const [donations, setDonations] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    paymentsApi
      .adminDonations(status)
      .then((res) => setDonations(res.data || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load donations'))
      .finally(() => setLoading(false))
  }, [status])

  const totals = useMemo(() => {
    return donations.reduce(
      (acc, row) => {
        if (row.status === 'success') {
          acc.paid += Number(row.amount) || 0
          acc.count += 1
        }
        return acc
      },
      { paid: 0, count: 0 },
    )
  }, [donations])

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="headline-lg text-primary mb-2">Donations</h1>
          <p className="body-md text-on-surface-variant max-w-2xl">
            Donor messages and payment status from the public donation form.
          </p>
        </div>
        <label className="block min-w-[180px]">
          <span className="label-md text-on-surface-variant block mb-1">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-select w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-panel rounded-xl border border-outline-variant/30 p-5">
          <p className="label-md text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">Paid total</p>
          <p className="headline-sm text-primary-fixed">{formatMoney(totals.paid, 'GHS')}</p>
        </div>
        <div className="glass-panel rounded-xl border border-outline-variant/30 p-5">
          <p className="label-md text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">Paid gifts</p>
          <p className="headline-sm text-primary">{totals.count}</p>
        </div>
        <div className="glass-panel rounded-xl border border-outline-variant/30 p-5">
          <p className="label-md text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">Visible rows</p>
          <p className="headline-sm text-primary">{donations.length}</p>
        </div>
      </div>

      {error && <p className="mb-4 p-3 rounded-lg bg-error/10 body-md" role="alert">{error}</p>}

      {loading ? (
        <p className="body-md text-on-surface-variant">Loading...</p>
      ) : donations.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center">
          <p className="body-md text-on-surface-variant">No donations found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-outline-variant/30 label-md text-on-surface-variant uppercase text-[10px]">
                <th className="py-3 pr-4">Donor</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Message</th>
                <th className="py-3 pr-4">Paid</th>
                <th className="py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((row) => (
                <tr key={row.id} className="border-b border-outline-variant/20 body-md align-top">
                  <td className="py-4 pr-4">
                    <div className="font-medium text-primary flex items-center gap-2">
                      {row.donor_name}
                      {row.is_anonymous && (
                        <span className="label-md text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <a href={`mailto:${row.donor_email}`} className="text-sm text-secondary-fixed">
                      {row.donor_email}
                    </a>
                  </td>
                  <td className="py-4 pr-4 font-bold text-on-surface whitespace-nowrap">
                    {formatMoney(row.amount, row.currency)}
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full border label-md text-xs ${statusClass(row.status)}`}>
                      {row.status_label || row.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 max-w-[260px] text-sm text-on-surface-variant">
                    {row.message || '-'}
                  </td>
                  <td className="py-4 pr-4 text-sm text-on-surface-variant whitespace-nowrap">
                    {formatDate(row.paid_at)}
                  </td>
                  <td className="py-4 text-xs text-on-surface-variant font-mono">
                    {row.payment_reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
