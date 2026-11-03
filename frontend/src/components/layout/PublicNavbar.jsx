import { LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import BrandLogo from '../ui/BrandLogo'

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-[0.95rem] font-medium transition-colors ${
    isActive ? 'text-slate-900 shadow-[inset_0_-2px_0_var(--neon)]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
  }`

const mobileNavLinkClass = ({ isActive }) =>
  `flex items-center gap-2 border-b border-slate-200 px-2 py-3.5 text-sm font-medium transition-colors ${
    isActive ? 'text-brand-500' : 'text-slate-500 hover:text-slate-900'
  }`

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Guides' },
  { to: '/categories', label: 'Categories' },
  { to: '/track', label: 'Track Order' },
  { to: '/gaming', label: 'Play' },
]

export default function PublicNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-[rgba(8,8,10,0.72)] backdrop-blur-[14px]">
      <div className="mx-auto flex h-[70px] max-w-[1160px] items-center justify-between gap-4 px-5">
        <Link to="/" onClick={closeMobile} aria-label="Home">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-1.5 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
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

          <button
            className="grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 text-slate-900 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-[rgba(8,8,10,0.97)] px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={mobileNavLinkClass} end={link.end} onClick={closeMobile}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    closeMobile()
                    navigate(user.role === 'admin' ? '/admin' : '/dashboard')
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closeMobile()
                    logout().then(() => navigate('/'))
                  }}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closeMobile()
                    navigate('/login')
                  }}
                >
                  <User className="h-4 w-4" /> Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    closeMobile()
                    navigate('/register')
                  }}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
