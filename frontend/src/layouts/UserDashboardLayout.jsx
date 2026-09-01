import { Download, Gift, LayoutDashboard, Package, ShoppingBag, User, Wallet, WalletCards } from 'lucide-react'
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
      { to: '/dashboard/wallet', label: 'Wallet', icon: WalletCards },
      { to: '/dashboard/refer-earn', label: 'Refer & Earn', icon: Gift },
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
