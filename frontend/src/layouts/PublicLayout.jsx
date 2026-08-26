import { Outlet } from 'react-router-dom'
import PublicNavbar from '../components/layout/PublicNavbar'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} DigitalMarketplace. Payments accepted in cryptocurrency only.
      </footer>
    </div>
  )
}
