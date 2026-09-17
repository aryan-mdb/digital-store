import { Bitcoin, Gamepad2, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import { unwrapPaginated } from '../../utils/pagination'
import usePageMeta from '../../hooks/usePageMeta'

export default function HomePage() {
  usePageMeta(
    null,
    'Premium software, templates, ebooks, courses and graphics — instant download after a secure cryptocurrency payment. Plus daily spin-the-wheel and quiz mini-games.'
  )
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
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="bg-grid-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

        <div className="relative">
          <span className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-300">
            <Sparkles className="h-3.5 w-3.5" /> Level up your downloads
          </span>

          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Premium digital loot,
            <br />
            paid for in <span className="text-gradient-gold">crypto</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
            Software, templates, ebooks, courses and graphics — instant download after a secure
            cryptocurrency payment.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="glow-gold relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3 font-bold text-white transition hover:brightness-110"
            >
              <span className="animate-shimmer absolute inset-0" />
              <span className="relative">Browse Products</span>
            </Link>
            <Link
              to="/gaming"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-500/40 bg-white/5 px-6 py-3 font-semibold text-brand-300 hover:bg-white/10"
            >
              <Gamepad2 className="h-5 w-5" /> Spin & Win
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
            <Feature icon={Bitcoin} title="Crypto only" desc="Pay securely with BTC, ETH, USDC and more." />
            <Feature icon={Zap} title="Instant delivery" desc="Download the moment payment is confirmed." />
            <Feature icon={ShieldCheck} title="Verified on-chain" desc="Payments verified server-side, never trusted from the browser." />
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="px-4 py-12 sm:px-6">
          <h2 className="mb-5 text-xl font-bold text-white">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category_id=${category.id}`}
                className="group rounded-xl border border-white/10 bg-surface-1 p-4 text-center shadow-sm transition hover:border-brand-500/40 hover:shadow-md"
              >
                <p className="font-medium text-white group-hover:text-brand-300">{category.name}</p>
                <p className="text-xs text-slate-500">{category.products_count ?? 0} products</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="px-4 py-12 sm:px-6">
          <h2 className="mb-5 text-xl font-bold text-white">Latest Products</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-medium text-white">{title}</p>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  )
}
