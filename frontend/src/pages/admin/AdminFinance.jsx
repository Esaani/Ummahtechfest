import { useCallback, useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ApiError, paymentsApi } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import AdminFormSelect from '../../components/admin/AdminFormSelect'

import { useLocation, useNavigate, Navigate } from 'react-router-dom'

// ─── Formatting Helpers ──────────────────────────────────────────────────────

function fmtGhs(amount) {
  if (amount === undefined || amount === null) return 'GHS 0.00'
  return `GHS ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent = false }) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 flex flex-col gap-3 border transition-all duration-300 ${
        accent
          ? 'border-[var(--primary-neon)]/30 shadow-[0_0_24px_rgba(163,250,1,0.15)]'
          : 'border-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`material-symbols-outlined text-3xl ${accent ? 'text-[var(--primary-neon)]' : 'text-primary-fixed'}`}
        >
          {icon}
        </span>
      </div>
      <div>
        <p className="text-3xl font-headline font-bold text-on-surface">{value}</p>
        <p className="text-sm font-technical text-on-surface-variant mt-0.5">{label}</p>
      </div>
      {sub && <p className="text-xs text-on-surface-variant/70 font-technical">{sub}</p>}
    </div>
  )
}

function ProgressBar({ label, current, target, color = '#a3fa01' }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between text-xs font-technical text-on-surface-variant">
        <span className="font-bold text-on-surface">{label}</span>
        <span>
          {fmtGhs(current)} <span className="opacity-50">/ {fmtGhs(target)}</span>
        </span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="text-[10px] text-right text-on-surface-variant font-technical">{pct}% Achieved</div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminFinance() {
  const { isSuperAdmin } = useAuth()
  const location = useLocation()
  
  // Determine active tab from URL path
  const path = location.pathname
  let activeTab = 'overview'
  if (path.includes('wallets')) activeTab = 'wallet'
  else if (path.includes('transactions')) activeTab = 'transactions'
  else if (path.includes('bills-expenses')) activeTab = 'bills'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Data State
  const [overview, setOverview] = useState(null)
  const [wallets, setWallets] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [bills, setBills] = useState([])
  const [expenses, setExpenses] = useState([])
  const [goals, setGoals] = useState([])

  // Modal State
  const [showModal, setShowModal] = useState(null) // 'withdrawal', 'bill', 'expense', 'goal', 'wallet', 'review_withdrawal'
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [ovRes, walRes, wdrRes, bilRes, expRes, glRes] = await Promise.all([
        paymentsApi.financeOverview().catch(() => ({ data: {} })),
        paymentsApi.financeWallets().catch(() => []),
        paymentsApi.adminWithdrawals().catch(() => ({ data: [] })),
        paymentsApi.financeBills().catch(() => []),
        paymentsApi.financeExpenses().catch(() => []),
        paymentsApi.financeGoals().catch(() => []),
      ])
      setOverview(ovRes.data || {})
      setWallets(walRes.data || walRes.results || walRes || [])
      setWithdrawals(wdrRes.data || wdrRes.results || wdrRes || [])
      setBills(bilRes.data || bilRes.results || bilRes || [])
      setExpenses(expRes.data || expRes.results || expRes || [])
      setGoals(glRes.data || glRes.results || glRes || [])
    } catch (err) {
      setError('Failed to load finance data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // --- Handlers ---
  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))

  const handleCreateWithdrawal = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await paymentsApi.createWithdrawal(formData)
      setShowModal(null)
      setSuccessMsg('Withdrawal request submitted.')
      loadData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveWithdrawal = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await paymentsApi.approveWithdrawal(formData.id, {
        status: formData.status,
        proof_notes: formData.proof_notes,
      })
      setShowModal(null)
      setSuccessMsg('Withdrawal updated.')
      loadData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Approval failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateEntity = async (e, apiMethod, successText) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await paymentsApi[apiMethod](formData)
      setShowModal(null)
      setSuccessMsg(successText)
      loadData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayBill = async (bill) => {
    if (!window.confirm(`Mark ${bill.name} as paid?`)) return
    try {
      await paymentsApi.updateBill(bill.id, { status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
      setSuccessMsg('Bill marked as paid.')
      loadData()
    } catch (err) {
      setError('Failed to update bill.')
    }
  }

  if (path === '/admin/finance') {
    return <Navigate to="/admin/finance/overview" replace />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="headline-lg text-primary mb-2">Finance Manager</h1>
        <p className="body-md text-on-surface-variant max-w-2xl">
          Track revenue, expenses, bills, and manage withdrawal requests.
        </p>
      </div>

      {error && <p className="p-3 rounded-lg bg-error/10 text-error body-md" role="alert">{error}</p>}
      {successMsg && <p className="p-3 rounded-lg bg-primary-fixed/10 text-primary-fixed body-md" role="alert">{successMsg}</p>}

      {loading && !overview ? (
        <p className="text-on-surface-variant animate-pulse">Loading finance data…</p>
      ) : (
        <div className="mt-6">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon="account_balance" label="Current Balance" value={fmtGhs(overview?.current_balance)} accent />
                <StatCard icon="arrow_downward" label="Total Revenue" value={fmtGhs(overview?.total_revenue)} sub="Passes + Donations" />
                <StatCard icon="arrow_upward" label="Total Expenses" value={fmtGhs(overview?.total_expenses)} sub="Paid expenses only" />
                <StatCard icon="pending_actions" label="Pending Bills" value={fmtGhs(overview?.total_bills_pending)} sub="Requires payment" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                  <h2 className="headline-sm mb-4">Revenue Breakdown</h2>
                  <div className="space-y-4">
                    <ProgressBar label="Pass Registrations" current={overview?.total_passes || 0} target={overview?.total_revenue || 1} color="#a3fa01" />
                    <ProgressBar label="Donations" current={overview?.total_donations || 0} target={overview?.total_revenue || 1} color="#e9c349" />
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                  <h2 className="headline-sm mb-4">Financial Health</h2>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
                    <div className="text-on-surface-variant font-technical">Total Withdrawals (Paid out)</div>
                    <div className="font-bold text-xl">{fmtGhs(overview?.total_withdrawals)}</div>
                  </div>
                  <div className="text-sm text-on-surface-variant leading-relaxed">
                    The current balance reflects all successful incoming payments minus approved withdrawals and logged expenses.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WALLETS & GOALS */}
          {activeTab === 'wallet' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="headline-sm">Funding Wallets</h2>
                <button onClick={() => { setFormData({}); setShowModal('wallet') }} className="btn-secondary px-4 py-2 rounded-lg text-sm">
                  + Add Wallet
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {wallets.map(w => (
                  <div key={w.id} className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 material-symbols-outlined text-8xl">account_balance_wallet</div>
                    <h3 className="font-bold text-lg mb-1 relative z-10">{w.name}</h3>
                    <p className="text-3xl font-headline font-bold text-[var(--primary-neon)] mb-2 relative z-10">{fmtGhs(w.balance)}</p>
                    <p className="text-xs text-on-surface-variant relative z-10">{w.description}</p>
                  </div>
                ))}
                {wallets.length === 0 && <p className="text-on-surface-variant">No wallets defined.</p>}
              </div>

              <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                <h2 className="headline-sm">Financial Goals</h2>
                <button onClick={() => { setFormData({}); setShowModal('goal') }} className="btn-secondary px-4 py-2 rounded-lg text-sm">
                  + Add Goal
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map(g => (
                  <div key={g.id} className="glass-card p-6 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-lg mb-4 flex justify-between">
                      {g.name}
                      {g.deadline && <span className="text-xs font-normal text-on-surface-variant">By {formatDate(g.deadline)}</span>}
                    </h3>
                    <ProgressBar label="Progress" current={g.current_amount} target={g.target_amount} color="#a3fa01" />
                  </div>
                ))}
                {goals.length === 0 && <p className="text-on-surface-variant">No active financial goals.</p>}
              </div>
            </div>
          )}

          {/* TAB: TRANSACTIONS (Withdrawals) */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="headline-sm">Withdrawal Requests</h2>
                <button onClick={() => { setFormData({ method: 'momo' }); setShowModal('withdrawal') }} className="btn-primary px-6 py-2 rounded-full font-bold">
                  Request Withdrawal
                </button>
              </div>
              
              <div className="glass-panel rounded-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-outline-variant/30 label-md text-on-surface-variant uppercase text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Requested By</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Account Info</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Approval</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((row) => (
                      <tr key={row.id} className="border-b border-outline-variant/20 body-md last:border-0 hover:bg-surface-bright/20">
                        <td className="py-4 px-4 font-technical text-sm">{formatDate(row.created_at)}</td>
                        <td className="py-4 px-4 font-medium">{row.requested_by_email}</td>
                        <td className="py-4 px-4 font-bold text-[var(--secondary-gold)]">{fmtGhs(row.amount)}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium">{row.account_name}</div>
                          <div className="text-xs text-on-surface-variant">{row.method.toUpperCase()} - {row.bank_or_network} ({row.account_number})</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            row.status === 'approved' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                            row.status === 'rejected' ? 'bg-red-500/20 text-red-700 dark:text-red-300' :
                            'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                          }`}>{row.status}</span>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {row.status !== 'pending' ? (
                            <>
                              <div className="font-medium">{row.approved_by_email || 'System'}</div>
                              <div className="text-on-surface-variant max-w-[200px] truncate" title={row.proof_notes}>{row.proof_notes}</div>
                            </>
                          ) : <span className="text-on-surface-variant">—</span>}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {row.status === 'pending' && isSuperAdmin && (
                            <button onClick={() => { setFormData({ id: row.id, status: 'approved', proof_notes: '', ...row }); setShowModal('review_withdrawal') }} className="text-[var(--primary-neon)] font-bold hover:underline">
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {withdrawals.length === 0 && (
                      <tr><td colSpan="7" className="py-8 text-center text-on-surface-variant">No withdrawals found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: BILLS & EXPENSES */}
          {activeTab === 'bills' && (
            <div className="space-y-12 animate-fade-in">
              {/* Bills */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="headline-sm text-[var(--secondary-gold)] flex items-center gap-2">
                    <span className="material-symbols-outlined">receipt</span> Pending Bills
                  </h2>
                  <button onClick={() => { setFormData({ status: 'pending' }); setShowModal('bill') }} className="btn-secondary px-4 py-2 rounded-lg text-sm">
                    + Add Bill
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bills.map(b => (
                    <div key={b.id} className="glass-card p-5 rounded-xl border border-white/10 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg leading-tight">{b.name}</h3>
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${b.status === 'paid' ? 'bg-green-500/20 text-green-400' : b.status === 'overdue' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>{b.status}</span>
                        </div>
                        <p className="text-2xl font-headline font-bold text-on-surface mb-4">{fmtGhs(b.amount)}</p>
                        <div className="text-xs text-on-surface-variant font-technical space-y-1">
                          <p>Due: {formatDate(b.due_date)}</p>
                          {b.category && <p>Cat: {b.category}</p>}
                        </div>
                      </div>
                      {b.status !== 'paid' && (
                        <button onClick={() => handlePayBill(b)} className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors">
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  ))}
                  {bills.length === 0 && <p className="text-on-surface-variant">No bills recorded.</p>}
                </div>
              </div>

              {/* Expenses */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="headline-sm text-[var(--primary-neon)] flex items-center gap-2">
                    <span className="material-symbols-outlined">outbound</span> Paid Expenses
                  </h2>
                  <button onClick={() => { setFormData({}); setShowModal('expense') }} className="btn-secondary px-4 py-2 rounded-lg text-sm">
                    + Log Expense
                  </button>
                </div>
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 label-md text-on-surface-variant uppercase text-[10px]">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Expense Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Wallet Used</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="border-b border-outline-variant/20 body-md last:border-0 hover:bg-surface-bright/20">
                          <td className="py-4 px-4 font-technical text-sm">{formatDate(exp.date)}</td>
                          <td className="py-4 px-4 font-medium">{exp.name}</td>
                          <td className="py-4 px-4 text-sm text-on-surface-variant">{exp.category || '—'}</td>
                          <td className="py-4 px-4 text-sm text-on-surface-variant">{exp.wallet_name || '—'}</td>
                          <td className="py-4 px-4 font-bold text-right text-red-400">-{fmtGhs(exp.amount)}</td>
                        </tr>
                      ))}
                      {expenses.length === 0 && (
                        <tr><td colSpan="5" className="py-8 text-center text-on-surface-variant">No expenses logged.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MODALS ───────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface border border-outline-variant/30 p-6 rounded-2xl max-w-md w-full shadow-xl my-8">
            
            {showModal === 'withdrawal' && (
              <>
                <h2 className="headline-sm text-primary mb-4">Request Withdrawal</h2>
                <form onSubmit={handleCreateWithdrawal} className="space-y-4">
                  <div>
                    <label className="label-md block mb-1">Amount (GHS)</label>
                    <input type="number" step="0.01" required value={formData.amount || ''} onChange={(e) => handleInputChange('amount', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" />
                  </div>
                  <AdminFormSelect label="Method" value={formData.method || 'momo'} onChange={(e) => handleInputChange('method', e.target.value)} options={[{ value: 'momo', label: 'Mobile Money' }, { value: 'bank', label: 'Bank Transfer' }]} />
                  <div>
                    <label className="label-md block mb-1">Account Name</label>
                    <input type="text" required value={formData.account_name || ''} onChange={(e) => handleInputChange('account_name', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="label-md block mb-1">Account Number</label>
                    <input type="text" required value={formData.account_number || ''} onChange={(e) => handleInputChange('account_number', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="label-md block mb-1">Bank / Network Name</label>
                    <input type="text" required value={formData.bank_or_network || ''} onChange={(e) => handleInputChange('bank_or_network', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setShowModal(null)} className="btn-text px-4 py-2">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary px-6 py-2 rounded-full font-bold">{submitting ? '…' : 'Submit'}</button>
                  </div>
                </form>
              </>
            )}

            {showModal === 'review_withdrawal' && (
              <>
                <h2 className="headline-sm text-primary mb-4">Review Withdrawal</h2>
                <div className="mb-4 text-sm bg-surface-container/50 p-4 rounded-lg">
                  <p><strong>Amount:</strong> {fmtGhs(formData.amount)}</p>
                  <p><strong>Method:</strong> {formData.method.toUpperCase()} ({formData.bank_or_network})</p>
                  <p><strong>Account:</strong> {formData.account_number} — {formData.account_name}</p>
                </div>
                <form onSubmit={handleApproveWithdrawal} className="space-y-4">
                  <AdminFormSelect label="Action" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} options={[{ value: 'approved', label: 'Approve & Mark Paid' }, { value: 'rejected', label: 'Reject' }]} />
                  <div>
                    <label className="label-md block mb-1">Proof Notes / Transaction Ref</label>
                    <textarea required={formData.status === 'approved'} value={formData.proof_notes || ''} onChange={(e) => handleInputChange('proof_notes', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2 min-h-[80px]" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setShowModal(null)} className="btn-text px-4 py-2">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary px-6 py-2 rounded-full font-bold">{submitting ? '…' : 'Confirm'}</button>
                  </div>
                </form>
              </>
            )}

            {showModal === 'wallet' && (
              <>
                <h2 className="headline-sm text-primary mb-4">Create Wallet</h2>
                <form onSubmit={(e) => handleCreateEntity(e, 'createWallet', 'Wallet created.')} className="space-y-4">
                  <div><label className="label-md block mb-1">Name</label><input required value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div><label className="label-md block mb-1">Initial Balance (GHS)</label><input type="number" step="0.01" value={formData.balance || 0} onChange={(e) => handleInputChange('balance', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(null)} className="btn-text px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="btn-primary px-6 py-2 rounded-full">Save</button></div>
                </form>
              </>
            )}

            {showModal === 'bill' && (
              <>
                <h2 className="headline-sm text-primary mb-4">Add Bill</h2>
                <form onSubmit={(e) => handleCreateEntity(e, 'createBill', 'Bill created.')} className="space-y-4">
                  <div><label className="label-md block mb-1">Name / Vendor</label><input required value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div><label className="label-md block mb-1">Amount (GHS)</label><input type="number" step="0.01" required value={formData.amount || ''} onChange={(e) => handleInputChange('amount', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div><label className="label-md block mb-1">Due Date</label><input type="date" required value={formData.due_date || ''} onChange={(e) => handleInputChange('due_date', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div><label className="label-md block mb-1">Category</label><input value={formData.category || ''} onChange={(e) => handleInputChange('category', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(null)} className="btn-text px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="btn-primary px-6 py-2 rounded-full">Save</button></div>
                </form>
              </>
            )}

            {showModal === 'expense' && (
              <>
                <h2 className="headline-sm text-primary mb-4">Log Expense</h2>
                <form onSubmit={(e) => handleCreateEntity(e, 'createExpense', 'Expense logged.')} className="space-y-4">
                  <div><label className="label-md block mb-1">Description</label><input required value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div><label className="label-md block mb-1">Amount (GHS)</label><input type="number" step="0.01" required value={formData.amount || ''} onChange={(e) => handleInputChange('amount', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div><label className="label-md block mb-1">Date Paid</label><input type="date" required value={formData.date || ''} onChange={(e) => handleInputChange('date', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <AdminFormSelect label="Wallet Used" value={formData.wallet_used || ''} onChange={(e) => handleInputChange('wallet_used', e.target.value)} options={[{value: '', label: '-- None --'}, ...wallets.map(w => ({value: w.id, label: w.name}))]} />
                  <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(null)} className="btn-text px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="btn-primary px-6 py-2 rounded-full">Save</button></div>
                </form>
              </>
            )}

            {showModal === 'goal' && (
              <>
                <h2 className="headline-sm text-primary mb-4">Add Goal</h2>
                <form onSubmit={(e) => handleCreateEntity(e, 'createGoal', 'Goal created.')} className="space-y-4">
                  <div><label className="label-md block mb-1">Name (e.g. Sponsorship Target)</label><input required value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div><label className="label-md block mb-1">Target Amount (GHS)</label><input type="number" step="0.01" required value={formData.target_amount || ''} onChange={(e) => handleInputChange('target_amount', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div><label className="label-md block mb-1">Current Amount (GHS)</label><input type="number" step="0.01" value={formData.current_amount || 0} onChange={(e) => handleInputChange('current_amount', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div><label className="label-md block mb-1">Deadline (Optional)</label><input type="date" value={formData.deadline || ''} onChange={(e) => handleInputChange('deadline', e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2" /></div>
                  <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(null)} className="btn-text px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="btn-primary px-6 py-2 rounded-full">Save</button></div>
                </form>
              </>
            )}
            
          </div>
        </div>
      )}
    </div>
  )
}
