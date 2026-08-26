import { ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'
import Badge from './ui/Badge'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-40 items-center justify-center bg-slate-100">
        {product.thumbnail_url ? (
          <img src={product.thumbnail_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-8 w-8 text-slate-300" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category?.name && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-brand-600">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{product.short_description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-slate-900">{formatCurrency(product.price, product.currency)}</span>
          {product.is_purchased && <Badge color="green">Owned</Badge>}
        </div>
      </div>
    </Link>
  )
}
