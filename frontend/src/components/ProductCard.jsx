import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'
import Badge from './ui/Badge'

const pad = (n) => String(n).padStart(2, '0')

export default function ProductCard({ product, index, revealDelay = 0 }) {
  const [imgFailed, setImgFailed] = useState(false)

  // Feeds the radial glow in .neon-card::before so it follows the pointer.
  const trackGlow = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div data-reveal="up" style={{ '--reveal-delay': `${revealDelay}ms` }} className="h-full">
      <Link
        to={`/products/${product.slug}`}
        onMouseMove={trackGlow}
        className="neon-card group flex h-full flex-col gap-3 p-[26px] hover:no-underline"
      >
        {product.thumbnail_url && !imgFailed && (
          <div className="-mx-[26px] -mt-[26px] mb-2 h-44 overflow-hidden border-b border-slate-200">
            <img
              src={product.thumbnail_url}
              alt={product.name}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-[0.85rem] text-slate-500">{index != null ? `GUIDE ${pad(index + 1)}` : 'GUIDE'}</span>
          {product.category?.name && <span className="neon-tag">{product.category.name}</span>}
        </div>
        <h3 className="mt-1.5 text-[1.3rem] font-bold text-slate-900">{product.name}</h3>
        <p className="line-clamp-3 text-[0.95rem] text-slate-500">{product.short_description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="font-display text-[1.3rem] font-bold text-slate-900">{formatCurrency(product.price, product.currency)}</span>
          {product.is_purchased ? (
            <Badge color="green">Owned</Badge>
          ) : (
            <span className="btn-neon shrink-0 whitespace-nowrap px-[18px]! py-[9px]! text-[0.9rem]!">Buy guide</span>
          )}
        </div>
      </Link>
    </div>
  )
}
