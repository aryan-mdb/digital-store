import { ArrowRight, Award, Droplet, Flame, Hand, Leaf, MapPin, Milk, Sparkles, Sun } from 'lucide-react'
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

// The four roundels printed on the back of the jar.
const PROMISES = [
  { icon: Award, title: '100% Pure', desc: 'Cow ghee, nothing else' },
  { icon: Leaf, title: 'Natural', desc: '& chemical free' },
  { icon: Droplet, title: 'Rich Aroma', desc: '& homely taste' },
  { icon: Flame, title: 'Traditional Care', desc: 'Slow-cooked in small batches' },
]

const PROCESS = [
  { icon: Sun, title: 'Grass-fed desi cows', desc: 'Our cows graze freely in open village pastures.' },
  { icon: Milk, title: 'Curd is set overnight', desc: 'Fresh milk is boiled and set into curd the natural way.' },
  { icon: Hand, title: 'Hand-churned bilona', desc: 'Curd is churned by hand to gather pure makhan.' },
  { icon: Flame, title: 'Slow-cooked to gold', desc: 'Makhan is simmered on a low flame into danedar ghee.' },
]

export default function HomePage() {
  usePageMeta(
    null,
    'PAYAN Pure Cow Ghee — A2 desi cow ghee and hand-churned bilona ghee, natural and chemical free. Pay with UPI, cards or Cash on Delivery and track your order live.'
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
          {PROMISES.map((p, i) => (
            <div key={p.title} data-reveal="up" style={{ '--reveal-delay': `${i * 110}ms` }}>
              <div className="group flex cursor-default flex-col items-center gap-2 px-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-forest-600/70 text-forest-ink transition-all duration-300 group-hover:scale-110 group-hover:border-forest-700 group-hover:bg-forest-700 group-hover:text-ghee-100 group-hover:shadow-lg">
                <p.icon className="group-hover-wiggle h-6 w-6" strokeWidth={1.6} />
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-900">{p.title}</p>
              <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="Explore" title="Shop by Category" subtitle="पवित्र स्वाद • शुद्धता का भरोसा" />
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category, i) => (
              <div key={category.id} data-reveal="zoom" style={{ '--reveal-delay': `${(i % 4) * 100}ms` }}>
              <Link
                to={`/products?category_id=${category.id}`}
                data-ripple
                className="group flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-xl active:scale-95"
              >
                <div className="bg-gold-foil mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full p-[3px] transition-transform duration-700 group-hover:rotate-[360deg] group-hover:scale-110">
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
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How PAYAN ghee is made — mirrors the village illustration on the label */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading
          eyebrow="Made the traditional way"
          title="From our village to your kitchen"
          subtitle="The same bilona method our grandmothers used — no shortcuts, no chemicals."
        />
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((step, i) => (
            <li key={step.title} data-reveal="up" style={{ '--reveal-delay': `${i * 130}ms` }}>
              <div className="card-label group relative h-full rounded-2xl p-6 text-center transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <span className="absolute left-4 top-3 font-display text-3xl font-extrabold text-brand-500/30">{i + 1}</span>
              <div className="bg-gold-foil mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full p-[3px] transition-transform duration-300 group-hover:scale-110">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-forest-ink">
                  <step.icon className="group-hover-wiggle h-7 w-7" strokeWidth={1.6} />
                </div>
              </div>
              <p className="font-display text-lg font-bold text-slate-900">{step.title}</p>
              <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <SectionHeading eyebrow="Pure · Natural · Traditional" title="Our Ghee Collection" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} revealDelay={(i % 4) * 110} />
            ))}
          </div>
          <div className="mt-10 text-center" data-reveal="up">
            <Link
              to="/products"
              data-ripple
              className="btn-shine group inline-flex items-center gap-2 rounded-xl border-2 border-forest-600 px-6 py-2.5 font-semibold text-forest-ink transition hover:bg-forest-600 hover:text-brand-100 active:scale-95"
            >
              View all ghee <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      )}

      {/* Tracking + WhatsApp band */}
      <section className="bg-ghee-glow relative overflow-hidden">
        <div className="ornament-band flip" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div data-reveal="left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">Always in the loop</p>
            <h2 className="mt-2 text-3xl font-bold text-forest-ink sm:text-4xl">
              Track your order <span className="text-gradient-gold">live</span>
            </h2>
            <p className="mt-3 max-w-md text-slate-600">
              From packing to your doorstep — see every step and the current location on the map, any time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/track"
                data-ripple
                className="btn-shine inline-flex items-center gap-2 rounded-xl bg-forest-700 px-5 py-2.5 font-bold text-ghee-100 shadow-md transition hover:-translate-y-0.5 hover:bg-forest-600 hover:shadow-lg active:scale-95"
              >
                <MapPin className="h-4 w-4" /> Track Order
              </Link>
              {whatsapp?.enabled && (
                <a
                  href={whatsappLink(whatsapp.number, whatsapp.message)}
                  target="_blank"
                  rel="noreferrer"
                  data-ripple
                  className="btn-shine inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1ebe5b] hover:shadow-lg active:scale-95"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
          <ol className="space-y-3">
            {['Order placed', 'Packed with care', 'Shipped & on the way', 'Delivered to your door'].map((step, i) => (
              <li key={step} data-reveal="right" style={{ '--reveal-delay': `${i * 140}ms` }}>
                <div className="group flex items-center gap-4 rounded-xl border border-forest-700/15 bg-white/70 px-4 py-3 text-slate-800 shadow-sm backdrop-blur transition duration-300 hover:translate-x-1 hover:bg-white hover:shadow-md">
                <span className="bg-gold-foil flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display font-bold text-forest-900 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                  {i + 1}
                </span>
                <span className="font-medium">{step}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="ornament-band" />
      </section>
    </div>
  )
}
