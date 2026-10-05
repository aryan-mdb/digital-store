import { Home, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'
import BrandLogo from '../ui/BrandLogo'
import ThemeToggle from '../ui/ThemeToggle'

/**
 * Shared shell for both the user dashboard and the admin panel — a
 * collapsible sidebar of `sections` + a top bar with the signed-in user.
 *
 * sections: Array<{ title?: string, items: Array<{ to, label, icon }> }>
 */
export default function DashboardShell({ sections, brandLabel, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        onClick={() => setMobileOpen(false)}
        className="block border-b border-brand-300/15 px-5 py-4 transition hover:bg-white/5"
        title="Go to store home"
      >
        <BrandLogo onDark />
        <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.18em] text-brand-300/70">{brandLabel}</span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {sections.map((section, idx) => (
          <div key={idx}>
            {section.title && (
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300/70">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gold-foil text-forest-900 shadow-md shadow-black/20'
                        : 'text-[#f1dfb8]/80 hover:bg-white/10 hover:text-[#fdf3dc]'
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#f1dfb8]/80 hover:bg-white/10 hover:text-[#fdf3dc]"
        >
          <Home className="h-4 w-4" /> Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#f1dfb8]/80 hover:bg-white/10 hover:text-[#fdf3dc]"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="bg-forest-velvet sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{SidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="bg-forest-velvet w-64">{SidebarContent}</div>
          <div className="flex-1 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button className="rounded-lg p-1.5 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Visit Store</span>
            </Link>
            <ThemeToggle />
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs capitalize text-slate-500">{user?.role?.replace('_', ' ')}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-foil text-sm font-bold text-forest-900">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
