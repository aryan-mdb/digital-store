import { FolderOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import { categoryService } from '../../services/categoryService'
import { unwrapPaginated } from '../../utils/pagination'

export default function CategoriesPage() {
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
            <Link
              key={category.id}
              to={`/products?category_id=${category.id}`}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{category.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{category.description}</p>
                <p className="mt-2 text-xs font-medium text-brand-600">{category.products_count ?? 0} products</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
