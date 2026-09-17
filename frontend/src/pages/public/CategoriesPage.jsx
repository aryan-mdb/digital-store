import { FolderOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import { categoryService } from '../../services/categoryService'
import { unwrapPaginated } from '../../utils/pagination'
import usePageMeta from '../../hooks/usePageMeta'

function CategoryCard({ category }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <Link
      to={`/products?category_id=${category.id}`}
      className="group flex items-start gap-4 overflow-hidden rounded-xl border border-slate-200 bg-surface-1 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-900/20"
    >
      {category.image_url && !imgFailed ? (
        <img
          src={category.image_url}
          alt={category.name}
          onError={() => setImgFailed(true)}
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
          <FolderOpen className="h-6 w-6" />
        </div>
      )}
      <div>
        <h3 className="font-semibold text-slate-900 group-hover:text-brand-300">{category.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{category.description}</p>
        <p className="mt-2 text-xs font-medium text-brand-400">{category.products_count ?? 0} products</p>
      </div>
    </Link>
  )
}

export default function CategoriesPage() {
  usePageMeta(
    'Browse Categories',
    'Explore digital products by category — software, templates, ebooks, courses and graphics.'
  )
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoryService.list({ per_page: 50 }).then((res) => {
      setCategories(unwrapPaginated(res).items)
      setLoading(false)
    })
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Digital Products by Category</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}
