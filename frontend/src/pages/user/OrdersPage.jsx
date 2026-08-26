import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import Pagination from '../../components/ui/Pagination'
import Table from '../../components/ui/Table'
import { orderService } from '../../services/orderService'
import { formatCurrency, formatDate } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

export default function OrdersPage() {
  const [orders, setOrders] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    orderService.list({ page, per_page: 10 }).then((res) => {
      const { items, meta } = unwrapPaginated(res)
      setOrders(items)
      setMeta(meta)
    })
  }, [page])

  if (!orders) return <FullPageSpinner />

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {orders.length === 0 ? (
          <EmptyState title="No orders yet" />
        ) : (
          <>
            <Table columns={['Order', 'Product', 'Amount', 'Status', 'Payment', 'Date', '']}>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{order.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">{order.items?.[0]?.product_name}</td>
                  <td className="px-4 py-3">{formatCurrency(order.total_amount, order.currency)}</td>
                  <td className="px-4 py-3"><Badge status={order.status} /></td>
                  <td className="px-4 py-3"><Badge status={order.payment_status} /></td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {order.payment_status === 'pending' ? (
                      <Link to={`/dashboard/payments/${order.id}`}>
                        <Button size="sm">Pay Now</Button>
                      </Link>
                    ) : (
                      <Link to={`/dashboard/orders/${order.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                        View
                      </Link>
                    )}
                  </td>
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
