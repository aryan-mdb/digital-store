import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import Table from '../../components/ui/Table'
import { orderService } from '../../services/orderService'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

export default function PaymentsPage() {
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    orderService.list({ per_page: 100 }).then((res) => setOrders(unwrapPaginated(res).items))
  }, [])

  if (!orders) return <FullPageSpinner />

  const payments = orders.filter((o) => o.crypto_payment).map((o) => ({ order: o, payment: o.crypto_payment }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">My Payments</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {payments.length === 0 ? (
          <EmptyState title="No crypto payments yet" />
        ) : (
          <Table columns={['Order', 'Currency', 'Amount', 'Status', 'Date', '']}>
            {payments.map(({ order, payment }) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{order.order_number}</td>
                <td className="px-4 py-3">{payment.cryptocurrency || '—'}</td>
                <td className="px-4 py-3">{formatCurrency(payment.amount, order.currency)}</td>
                <td className="px-4 py-3"><Badge status={payment.status} /></td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(payment.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  {payment.status === 'pending' && (
                    <Link to={`/dashboard/payments/${order.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                      Continue
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  )
}
