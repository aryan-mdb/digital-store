import { LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`

export default function PublicNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <ShieldCheck className="h-6 w-6 text-brand-500" />
          DigitalMarketplace
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
          <NavLink to="/categories" className={navLinkClass}>
            Categories
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4" />
                {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => logout().then(() => navigate('/'))}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                <User className="h-4 w-4" /> Login
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
