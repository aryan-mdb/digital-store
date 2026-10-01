import { Mail, MapPin, ShieldCheck } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import PublicNavbar from '../components/layout/PublicNavbar'
import WhatsAppButton, { WhatsAppIcon } from '../components/WhatsAppButton'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { whatsappLink } from '../utils/whatsapp'

export default function PublicLayout() {
  const { whatsapp, payment_methods: methods } = useSiteSettings()

  const payLabels = [methods?.razorpay && 'Razorpay (UPI / Cards)', methods?.cod && 'Cash on Delivery', methods?.crypto && 'Crypto'].filter(
    Boolean
  )

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-maroon-velvet mt-16 text-[#f1dfb8]">
        <div className="ornament-band flip" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="flex items-center gap-2 font-display text-2xl font-bold text-[#fdf3dc]">
              <ShieldCheck className="h-6 w-6 text-brand-300" />
              Digital<span className="text-foil-bright">Marketplace</span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-[#f1dfb8]/80">
              Purity you can taste, quality you can trust — delivered to your doorstep with live order tracking.
            </p>
            {payLabels.length > 0 && (
              <p className="mt-4 text-xs uppercase tracking-wider text-brand-300">We accept: {payLabels.join(' · ')}</p>
            )}
          </div>

          <div>
            <p className="mb-3 font-semibold text-[#fdf3dc]">Quick links</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-brand-200">All products</Link></li>
              <li><Link to="/categories" className="hover:text-brand-200">Categories</Link></li>
              <li><Link to="/track" className="hover:text-brand-200">Track your order</Link></li>
              <li><Link to="/dashboard/orders" className="hover:text-brand-200">My orders</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-semibold text-[#fdf3dc]">Get in touch</p>
            <ul className="space-y-2 text-sm">
              {whatsapp?.enabled && (
                <li>
                  <a href={whatsappLink(whatsapp.number, whatsapp.message)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-200">
                    <WhatsAppIcon className="h-4 w-4" /> +{whatsapp.number}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@digitalmarketplace.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Delivering across India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-brand-300/15 py-4 text-center text-xs text-[#f1dfb8]/70">
          © {new Date().getFullYear()} DigitalMarketplace. All rights reserved.
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  )
}
