import { Link, Outlet } from 'react-router-dom'
import PublicNavbar from '../components/layout/PublicNavbar'
import WhatsAppButton, { WhatsAppIcon } from '../components/WhatsAppButton'
import BrandLogo from '../components/ui/BrandLogo'
import { SITE } from '../config/site'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { whatsappLink } from '../utils/whatsapp'

export default function PublicLayout() {
  const { whatsapp, payment_methods: methods } = useSiteSettings()

  const payLabels = [methods?.razorpay && 'Razorpay (UPI / Cards)', methods?.cod && 'Cash on Delivery', methods?.crypto && 'Crypto (USDT)'].filter(
    Boolean
  )

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-[#050506] pt-14">
        <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-10 px-5 pb-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link to="/">
              <BrandLogo />
            </Link>
            <p className="mt-3 max-w-[40ch] text-slate-500">{SITE.tagline}</p>
            {payLabels.length > 0 && (
              <p className="mt-4 text-xs uppercase tracking-[0.14em] text-slate-500">We accept: {payLabels.join(' · ')}</p>
            )}
          </div>

          <div>
            <h4 className="mb-3.5 text-[0.85rem] uppercase tracking-[0.14em] text-slate-500">Explore</h4>
            <ul className="grid gap-2 text-slate-900">
              <li><Link to="/products" className="hover:text-brand-500">All guides</Link></li>
              <li><Link to="/categories" className="hover:text-brand-500">Categories</Link></li>
              <li><Link to="/track" className="hover:text-brand-500">Track your order</Link></li>
              <li><Link to="/dashboard/refer-earn" className="hover:text-brand-500">Affiliate</Link></li>
              <li><Link to="/careers" className="hover:text-brand-500">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3.5 text-[0.85rem] uppercase tracking-[0.14em] text-slate-500">Contact</h4>
            <ul className="grid gap-2 text-slate-900">
              {whatsapp?.enabled && (
                <li>
                  <a href={whatsappLink(whatsapp.number, whatsapp.message)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-500">
                    <WhatsAppIcon className="h-4 w-4" /> +{whatsapp.number}
                  </a>
                </li>
              )}
              <li><Link to="/dashboard" className="hover:text-brand-500">My account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1160px] flex-wrap justify-between gap-2 border-t border-slate-200 px-5 py-5 text-[0.85rem] text-slate-500">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span>Learn · Earn · Return · Nurture</span>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  )
}
