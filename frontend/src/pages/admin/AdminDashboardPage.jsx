import { CheckCircle2, Clock, DollarSign, FolderTree, Package, ShoppingBag, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import Badge from '../../components/ui/Badge'
import Card, { StatCard } from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import Table from '../../components/ui/Table'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDate } from '../../utils/format'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminService.dashboard().then((res) => setStats(res.data))
  }, [])

  if (!stats) return <FullPageSpinner />

  const { cards, recent_orders, recent_users, recent_payments, best_selling_products, sales_by_category } = stats

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={cards.total_users} icon={Users} />
        <StatCard label="Active Users" value={cards.active_users} icon={CheckCircle2} accent="green" />
        <StatCard label="Total Products" value={cards.total_products} icon={Package} />
        <StatCard label="Total Categories" value={cards.total_categories} icon={FolderTree} />
        <StatCard label="Total Orders" value={cards.total_orders} icon={ShoppingBag} />
        <StatCard label="Completed Orders" value={cards.completed_orders} icon={CheckCircle2} accent="green" />
        <StatCard label="Pending Payments" value={cards.pending_payments} icon={Clock} accent="amber" />
        <StatCard label="Total Revenue" value={formatCurrency(cards.total_revenue)} icon={DollarSign} accent="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Recent Orders</h2>
          </div>
          {recent_orders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <Table columns={['Order', 'User', 'Amount', 'Status']}>
              {recent_orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">{o.user?.name}</td>
                  <td className="px-4 py-3">{formatCurrency(o.total_amount, o.currency)}</td>
                  <td className="px-4 py-3"><Badge status={o.status} /></td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Recent Users</h2>
          </div>
          {recent_users.length === 0 ? (
            <EmptyState title="No users yet" />
          ) : (
            <Table columns={['Name', 'Email', 'Status', 'Joined']}>
              {recent_users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3"><Badge status={u.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Best Selling Products</h2>
          </div>
          {best_selling_products.length === 0 ? (
            <EmptyState title="No sales yet" />
          ) : (
            <Table columns={['Product', 'Sales', 'Revenue']}>
              {best_selling_products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3">{p.sales_count}</td>
                  <td className="px-4 py-3">{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Sales by Category</h2>
          </div>
          {sales_by_category.length === 0 ? (
            <EmptyState title="No sales yet" />
          ) : (
            <Table columns={['Category', 'Sales', 'Revenue']}>
              {sales_by_category.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3">{c.sales_count}</td>
                  <td className="px-4 py-3">{formatCurrency(c.revenue)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Recent Crypto Payments</h2>
        </div>
        {recent_payments.length === 0 ? (
          <EmptyState title="No payments yet" />
        ) : (
          <Table columns={['Order', 'User', 'Amount', 'Currency', 'Status']}>
            {recent_payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{p.order_number}</td>
                <td className="px-4 py-3 text-slate-600">{p.user}</td>
                <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3">{p.cryptocurrency || '—'}</td>
                <td className="px-4 py-3"><Badge status={p.status} /></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}
