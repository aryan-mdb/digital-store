import { Award, Leaf, MapPin, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../../components/HeroSlider'
import ProductCard from '../../components/ProductCard'
import { WhatsAppIcon } from '../../components/WhatsAppButton'
import SectionHeading from '../../components/ui/SectionHeading'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import { unwrapPaginated } from '../../utils/pagination'
import { whatsappLink } from '../../utils/whatsapp'
import usePageMeta from '../../hooks/usePageMeta'

const PROMISES = [
  { icon: Award, title: '100% Genuine', desc: 'Quality you can trust' },
  { icon: Leaf, title: 'Natural & Pure', desc: 'Made with traditional care' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'Razorpay, COD & more' },
  { icon: Truck, title: 'Live Tracking', desc: 'Doorstep delivery' },
]

export default function HomePage() {
  usePageMeta(
    null,
    'Premium quality products with secure payments (Razorpay UPI, cards, Cash on Delivery) and live order tracking to your doorstep.'
  )
  const { whatsapp } = useSiteSettings()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    productService.list({ per_page: 8, sort: 'newest' }).then((res) => {
      setProducts(unwrapPaginated(res).items)
    })
    categoryService.list({ per_page: 6 }).then((res) => {
      setCategories(unwrapPaginated(res).items)
    })
  }, [])

  return (
    <div>
      <HeroSlider />

      {/* Promise strip — echoes the four icon roundels on the label */}
      <section className="relative z-10 mx-auto -mt-2 max-w-6xl px-4 pt-10 sm:px-6">
        <div className="card-label grid grid-cols-2 gap-y-6 rounded-2xl px-4 py-6 sm:grid-cols-4">
          {PROMISES.map((p) => (
            <div key={p.title} className="flex flex-col items-center gap-2 px-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-maroon-600/70 text-maroon-ink">
                <p.icon className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-900">{p.title}</p>
              <p className="text-xs text-slate-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="Explore" title="Shop by Category" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category_id=${category.id}`}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg"
              >
                <div className="bg-gold-foil mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full p-[3px]">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                    {category.image_url ? (
                      <img src={category.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Sparkles className="h-6 w-6 text-brand-600" />
                    )}
                  </div>
                </div>
                <p className="font-semibold text-slate-900 group-hover:text-brand-600">{category.name}</p>
                <p className="text-xs text-slate-500">{category.products_count ?? 0} products</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <SectionHeading eyebrow="Fresh arrivals" title="Our Latest Products" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-maroon-600 px-6 py-2.5 font-semibold text-maroon-ink transition hover:bg-maroon-600 hover:text-brand-100"
            >
              View all products
            </Link>
          </div>
        </section>
      )}

      {/* Tracking + WhatsApp band */}
      <section className="bg-maroon-velvet relative overflow-hidden">
        <div className="ornament-band flip" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-300">Always in the loop</p>
            <h2 className="mt-2 text-3xl font-bold text-[#fdf3dc] sm:text-4xl">
              Track your order <span className="text-foil-bright">live</span>
            </h2>
            <p className="mt-3 max-w-md text-[#f1dfb8]/85">
              From packing to your doorstep — see every step and the current location on the map, any time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/track"
                className="inline-flex items-center gap-2 rounded-xl bg-gold-foil px-5 py-2.5 font-bold text-maroon-900 transition hover:brightness-105"
              >
                <MapPin className="h-4 w-4" /> Track Order
              </Link>
              {whatsapp?.enabled && (
                <a
                  href={whatsappLink(whatsapp.number, whatsapp.message)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 font-semibold text-white transition hover:bg-[#1ebe5b]"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
          <ol className="space-y-3">
            {['Order placed', 'Packed with care', 'Shipped & on the way', 'Delivered to your door'].map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-4 rounded-xl border border-brand-300/20 bg-black/15 px-4 py-3 text-[#fdf3dc] backdrop-blur"
              >
                <span className="bg-gold-foil flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display font-bold text-maroon-900">
                  {i + 1}
                </span>
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="ornament-band" />
      </section>
    </div>
  )
}
