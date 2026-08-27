import { useEffect, useState } from 'react'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { Select } from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Table from '../../components/ui/Table'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

/**
 * A ledger view over the same crypto-payment records as the Payments page —
 * here framed as a raw transaction log (provider, tx id, crypto amount)
 * rather than a payment-status worklist.
 */
export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    adminService.transactions
      .list({ page, per_page: 15, status: statusFilter || undefined })
      .then((res) => {
        const { items, meta } = unwrapPaginated(res)
        setTransactions(items)
        setMeta(meta)
      })
  }, [page, statusFilter])

  if (!transactions) return <FullPageSpinner />

  const totalPaid = transactions
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-sm text-slate-500">
          Paid this page: <span className="font-semibold text-slate-900">{formatCurrency(totalPaid)}</span>
        </p>
      </div>

      <Select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="sm:w-44">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
        <option value="expired">Expired</option>
      </Select>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {transactions.length === 0 ? (
          <EmptyState title="No transactions found" />
        ) : (
          <>
            <Table columns={['Transaction ID', 'Order', 'Provider', 'Crypto Amount', 'Amount', 'Status', 'Date']}>
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{tx.transaction_id || '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{tx.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">{tx.payment_provider || '—'}</td>
                  <td className="px-4 py-3">
                    {tx.crypto_amount ?? '—'} {tx.cryptocurrency}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-3"><Badge status={tx.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(tx.created_at)}</td>
                </tr>
              ))}
            </Table>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
