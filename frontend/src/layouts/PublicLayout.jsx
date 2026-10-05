import { MapPin } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import PublicNavbar from '../components/layout/PublicNavbar'
import WhatsAppButton, { WhatsAppIcon } from '../components/WhatsAppButton'
import BrandLogo from '../components/ui/BrandLogo'
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

      <footer className="bg-forest-velvet mt-16 text-[#f1dfb8]">
        <div className="ornament-band flip" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <BrandLogo onDark />
            <p className="mt-3 font-display text-lg text-brand-200">पवित्र स्वाद • शुद्धता का भरोसा</p>
            <p className="mt-2 max-w-sm text-sm text-[#f1dfb8]/80">
              100% pure cow ghee, slow-cooked the traditional way from the milk of grass-fed desi cows — natural,
              chemical free and full of rich aroma.
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
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Delivering across India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-brand-300/15 py-4 text-center text-xs text-[#f1dfb8]/70">
          © {new Date().getFullYear()} PAYAN Pure Cow Ghee. All rights reserved.
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  )
}
