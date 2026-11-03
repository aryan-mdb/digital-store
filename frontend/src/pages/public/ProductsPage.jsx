import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Select } from '../../components/ui/Input'
import { categoryService } from '../../services/categoryService'
import { productService } from '../../services/productService'
import { unwrapPaginated } from '../../utils/pagination'
import usePageMeta from '../../hooks/usePageMeta'

export default function ProductsPage() {
  usePageMeta(
    'All Guides',
    'Practical digital guides on AI automation, marketing, sales and self-development. Pay with UPI, cards or crypto.'
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const categoryId = searchParams.get('category_id') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    categoryService.list({ per_page: 50 }).then((res) => setCategories(unwrapPaginated(res).items))
  }, [])

  useEffect(() => {
    setLoading(true)
    productService
      .list({
        search: searchParams.get('search') || undefined,
        category_id: categoryId || undefined,
        sort,
        page,
        per_page: 12,
      })
      .then((res) => {
        const { items, meta } = unwrapPaginated(res)
        setProducts(items)
        setMeta(meta)
      })
      .finally(() => setLoading(false))
  }, [searchParams])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="mx-auto max-w-[1160px] px-5 pb-16 pt-14 sm:pt-20">
      <p className="eyebrow">Guides</p>
      <h1 className="mb-3 text-[clamp(1.9rem,4vw,2.8rem)] font-bold text-slate-900">Every guide, one place.</h1>
      <p className="mb-8 max-w-[60ch] text-[1.05rem] text-slate-500">Pick a topic, or browse them all. Pay with UPI, cards or crypto — access is instant.</p>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {[{ id: '', name: 'All' }, ...categories].map((c) => {
            const active = String(c.id) === categoryId
            return (
              <button
                key={c.id || 'all'}
                type="button"
                onClick={() => updateParam('category_id', c.id)}
                className={`rounded-full border px-[18px] py-2 text-[0.92rem] transition-all ${
                  active
                    ? 'border-brand-500 bg-[var(--neon-soft)] text-white shadow-[var(--glow)]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-500 hover:text-slate-900'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            updateParam('search', search)
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides..."
            className="w-full rounded-full border border-slate-200 bg-slate-100 py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none"
          />
        </form>

        <Select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="sm:w-44">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name</option>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-[14px] bg-slate-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No guides found" message="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={((meta?.current_page ?? 1) - 1) * 12 + i}
                revealDelay={(i % 4) * 90}
              />
            ))}
          </div>
          <div className="mt-6">
            <Pagination
              meta={meta}
              onPageChange={(p) => {
                const next = new URLSearchParams(searchParams)
                next.set('page', p)
                setSearchParams(next)
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
