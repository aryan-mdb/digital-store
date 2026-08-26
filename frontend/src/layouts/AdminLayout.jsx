import {
  FolderTree,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Users,
  Wallet,
} from 'lucide-react'
import { Outlet } from 'react-router-dom'
import DashboardShell from '../components/layout/DashboardShell'

const sections = [
  {
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Catalog',
    items: [
      { to: '/admin/categories', label: 'Categories', icon: FolderTree },
      { to: '/admin/products', label: 'Products', icon: Package },
    ],
  },
  {
    items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { to: '/admin/payments', label: 'Payments', icon: Wallet },
      { to: '/admin/transactions', label: 'Transactions', icon: Receipt },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function AdminLayout() {
  return (
    <DashboardShell sections={sections} brandLabel="Admin Panel">
      <Outlet />
    </DashboardShell>
  )
}
