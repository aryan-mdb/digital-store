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

export default function ProductsPage() {
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">All Products</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
            placeholder="Search products..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </form>

        <Select value={categoryId} onChange={(e) => updateParam('category_id', e.target.value)} className="sm:w-48">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="sm:w-44">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name</option>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" message="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
