import { Download, LayoutDashboard, Package, ShoppingBag, User, Wallet } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import DashboardShell from '../components/layout/DashboardShell'

const sections = [
  {
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/dashboard/products', label: 'Products', icon: Package },
      { to: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
      { to: '/dashboard/payments', label: 'Payments', icon: Wallet },
      { to: '/dashboard/downloads', label: 'Downloads', icon: Download },
      { to: '/dashboard/profile', label: 'Profile', icon: User },
    ],
  },
]

export default function UserDashboardLayout() {
  return (
    <DashboardShell sections={sections} brandLabel="My Account">
      <Outlet />
    </DashboardShell>
  )
}
