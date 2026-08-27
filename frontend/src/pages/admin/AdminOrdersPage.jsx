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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [viewing, setViewing] = useState(null)

  const load = () =>
    adminService.orders
      .list({
        page,
        per_page: 15,
        search: search || undefined,
        status: statusFilter || undefined,
        payment_status: paymentFilter || undefined,
      })
      .then((res) => {
        const { items, meta } = unwrapPaginated(res)
        setOrders(items)
        setMeta(meta)
      })

  useEffect(() => {
    load()
  }, [page, statusFilter, paymentFilter])

  if (!orders) return <FullPageSpinner />

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Orders</h1>

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
            placeholder="Search by order number..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </form>
        <Select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="sm:w-44">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
        </Select>
        <Select value={paymentFilter} onChange={(e) => { setPage(1); setPaymentFilter(e.target.value) }} className="sm:w-44">
          <option value="">All payment statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {orders.length === 0 ? (
          <EmptyState title="No orders found" />
        ) : (
          <>
            <Table columns={['Order', 'User', 'Amount', 'Status', 'Payment', 'Date', '']}>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{order.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{order.user?.name}</p>
                    <p className="text-xs text-slate-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(order.total_amount, order.currency)}</td>
                  <td className="px-4 py-3"><Badge status={order.status} /></td>
                  <td className="px-4 py-3"><Badge status={order.payment_status} /></td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(order.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewing(order)} className="text-sm font-medium text-brand-600 hover:underline">
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Customer</p>
                <p className="font-medium text-slate-900">{viewing.user?.name}</p>
                <p className="text-slate-500">{viewing.user?.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Placed</p>
                <p className="font-medium text-slate-900">{formatDateTime(viewing.created_at)}</p>
              </div>
              <div>
                <p className="text-slate-500">Order Status</p>
                <Badge status={viewing.status} />
              </div>
              <div>
                <p className="text-slate-500">Payment Status</p>
                <Badge status={viewing.payment_status} />
              </div>
              {viewing.crypto_payment && (
                <div>
                  <p className="text-slate-500">Cryptocurrency</p>
                  <p className="font-medium text-slate-900">{viewing.crypto_payment.cryptocurrency || '—'}</p>
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Items</p>
              <Table columns={['Product', 'Price', 'Qty']}>
                {viewing.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-slate-900">{item.product_name}</td>
                    <td className="px-4 py-3">{formatCurrency(item.price, viewing.currency)}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                  </tr>
                ))}
              </Table>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3 text-sm font-semibold text-slate-900">
              Total: {formatCurrency(viewing.total_amount, viewing.currency)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
