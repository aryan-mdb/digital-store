import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import Table from '../../components/ui/Table'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewing, setViewing] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const load = () =>
    adminService.payments
      .list({
        page,
        per_page: 15,
        search: search || undefined,
        status: statusFilter || undefined,
      })
      .then((res) => {
        const { items, meta } = unwrapPaginated(res)
        setPayments(items)
        setMeta(meta)
      })

  useEffect(() => {
    load()
  }, [page, statusFilter])

  const openView = async (payment) => {
    setViewing(payment)
    setLoadingDetail(true)
    try {
      const res = await adminService.payments.get(payment.id)
      setViewing(res.data)
    } finally {
      setLoadingDetail(false)
    }
  }

  if (!payments) return <FullPageSpinner />

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Payments</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            load()
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or transaction ID..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </form>
        <Select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="sm:w-44">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {payments.length === 0 ? (
          <EmptyState title="No payments found" />
        ) : (
          <>
            <Table columns={['Order', 'Crypto', 'Amount', 'Status', 'Paid At', '']}>
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{payment.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">{payment.cryptocurrency || '—'}</td>
                  <td className="px-4 py-3">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3"><Badge status={payment.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(payment.paid_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openView(payment)} className="text-sm font-medium text-brand-600 hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.order_number} size="lg">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500">Status</p>
                <Badge status={viewing.status} />
              </div>
              <div>
                <p className="text-slate-500">Cryptocurrency</p>
                <p className="font-medium text-slate-900">{viewing.cryptocurrency || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">Amount (USD)</p>
                <p className="font-medium text-slate-900">{formatCurrency(viewing.amount)}</p>
              </div>
              <div>
                <p className="text-slate-500">Crypto Amount</p>
                <p className="font-medium text-slate-900">{viewing.crypto_amount ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">Provider</p>
                <p className="font-medium text-slate-900">{viewing.payment_provider || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">Created</p>
                <p className="font-medium text-slate-900">{formatDateTime(viewing.created_at)}</p>
              </div>
              <div>
                <p className="text-slate-500">Paid At</p>
                <p className="font-medium text-slate-900">{formatDateTime(viewing.paid_at)}</p>
              </div>
              <div>
                <p className="text-slate-500">Expires At</p>
                <p className="font-medium text-slate-900">{formatDateTime(viewing.expires_at)}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-500">Transaction ID</p>
              <p className="break-all font-mono text-xs text-slate-900">{viewing.transaction_id || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500">Wallet Address</p>
              <p className="break-all font-mono text-xs text-slate-900">{viewing.wallet_address || '—'}</p>
            </div>

            {loadingDetail && <p className="text-xs text-slate-400">Loading full details…</p>}
          </div>
        )}
      </Modal>
    </div>
  )
}
