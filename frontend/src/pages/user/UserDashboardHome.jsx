import { CheckCircle2, Clock, Package, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import { StatCard } from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import Table from '../../components/ui/Table'
import { useAuth } from '../../context/AuthContext'
import { orderService } from '../../services/orderService'
import { formatCurrency, formatDate } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

export default function UserDashboardHome() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    orderService.list({ per_page: 100 }).then((res) => setOrders(unwrapPaginated(res).items))
  }, [])

  if (!orders) return <FullPageSpinner />

  const completed = orders.filter((o) => o.status === 'completed')
  const pending = orders.filter((o) => o.payment_status === 'pending')
  const purchasedProducts = completed.flatMap((o) => o.items)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="text-slate-500">Here's what's happening with your account.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Purchases" value={orders.length} icon={ShoppingBag} />
        <StatCard label="Completed Orders" value={completed.length} icon={CheckCircle2} accent="green" />
        <StatCard label="Pending Payments" value={pending.length} icon={Clock} accent="amber" />
        <StatCard label="Products Owned" value={purchasedProducts.length} icon={Package} accent="brand" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="Browse the catalog and buy your first digital product."
            action={
              <Link to="/products" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                Browse Products
              </Link>
            }
          />
        ) : (
          <Table columns={['Order', 'Amount', 'Status', 'Payment', 'Date']}>
            {orders.slice(0, 5).map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/dashboard/orders/${order.id}`} className="font-medium text-brand-600 hover:underline">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">{formatCurrency(order.total_amount, order.currency)}</td>
                <td className="px-4 py-3"><Badge status={order.status} /></td>
                <td className="px-4 py-3"><Badge status={order.payment_status} /></td>
                <td className="px-4 py-3 text-slate-500">{formatDate(order.created_at)}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  )
}
