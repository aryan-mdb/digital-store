import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import UserRoute from './routes/UserRoute'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import UserDashboardLayout from './layouts/UserDashboardLayout'

import HomePage from './pages/public/HomePage'
import ProductsPage from './pages/public/ProductsPage'
import ProductDetailsPage from './pages/public/ProductDetailsPage'
import CategoriesPage from './pages/public/CategoriesPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import UserDashboardHome from './pages/user/UserDashboardHome'
import OrdersPage from './pages/user/OrdersPage'
import OrderDetailsPage from './pages/user/OrderDetailsPage'
import PaymentsPage from './pages/user/PaymentsPage'
import DownloadsPage from './pages/user/DownloadsPage'
import ProfilePage from './pages/user/ProfilePage'
import WalletPage from './pages/user/WalletPage'
import ReferralPage from './pages/user/ReferralPage'
import CryptoPaymentPage from './pages/user/CryptoPaymentPage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage'
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900">404</h1>
      <p className="text-slate-500">This page doesn&apos;t exist.</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<UserRoute />}>
            <Route element={<UserDashboardLayout />}>
              <Route path="/dashboard" element={<UserDashboardHome />} />
              <Route path="/dashboard/products" element={<ProductsPage />} />
              <Route path="/dashboard/orders" element={<OrdersPage />} />
              <Route path="/dashboard/orders/:orderId" element={<OrderDetailsPage />} />
              <Route path="/dashboard/payments" element={<PaymentsPage />} />
              <Route path="/dashboard/payments/:orderId" element={<CryptoPaymentPage />} />
              <Route path="/dashboard/downloads" element={<DownloadsPage />} />
              <Route path="/dashboard/wallet" element={<WalletPage />} />
              <Route path="/dashboard/refer-earn" element={<ReferralPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
