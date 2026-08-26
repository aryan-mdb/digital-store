import { Bitcoin, ShieldCheck, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import { unwrapPaginated } from '../../utils/pagination'

export default function HomePage() {
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
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white px-4 py-16 text-center sm:px-6">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Premium digital products, paid for in crypto
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Software, templates, ebooks, courses and graphics — instant download after a secure
          cryptocurrency payment.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/products" className="rounded-lg bg-brand-500 px-5 py-2.5 font-medium text-white hover:bg-brand-600">
            Browse Products
          </Link>
          <Link to="/categories" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
            View Categories
          </Link>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          <Feature icon={Bitcoin} title="Crypto only" desc="Pay securely with BTC, ETH, USDC and more." />
          <Feature icon={Zap} title="Instant delivery" desc="Download the moment payment is confirmed." />
          <Feature icon={ShieldCheck} title="Verified on-chain" desc="Payments verified server-side, never trusted from the browser." />
        </div>
      </section>

      {categories.length > 0 && (
        <section className="px-4 py-12 sm:px-6">
          <h2 className="mb-5 text-xl font-bold text-slate-900">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category_id=${category.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm hover:shadow-md"
              >
                <p className="font-medium text-slate-900">{category.name}</p>
                <p className="text-xs text-slate-500">{category.products_count ?? 0} products</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="px-4 py-12 sm:px-6">
          <h2 className="mb-5 text-xl font-bold text-slate-900">Latest Products</h2>
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
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-medium text-slate-900">{title}</p>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  )
}
