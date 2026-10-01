import { Gamepad2, MapPin, LayoutDashboard, LogOut, Menu, ShieldCheck, User, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-maroon-ink font-semibold' : 'text-slate-600 hover:text-slate-900'}`

const mobileNavLinkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-500/15 text-maroon-ink' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/track', label: 'Track Order', icon: MapPin },
  { to: '/gaming', label: 'Gaming', icon: Gamepad2 },
]

export default function PublicNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-surface-1/90 backdrop-blur-lg">
      <div className="bg-maroon-velvet px-4 py-1.5 text-center text-xs font-medium tracking-wide text-brand-100">
        Pure quality · Secure payments · Live order tracking
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-maroon-ink" onClick={closeMobile}>
          <ShieldCheck className="h-7 w-7 text-brand-600" />
          <span>
            Digital<span className="text-gradient-gold">Marketplace</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.end}>
              <span className="inline-flex items-center gap-1.5">
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden lg:inline-flex" />

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
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-surface-1/95 px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={mobileNavLinkClass} end={link.end} onClick={closeMobile}>
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-sm font-medium text-slate-600">Theme</span>
            <ThemeToggle />
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3">
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
