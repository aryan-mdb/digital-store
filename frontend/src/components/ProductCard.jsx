import { ImageOff } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'
import Badge from './ui/Badge'

const MAX_TILT = 8

export default function ProductCard({ product }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const [hovering, setHovering] = useState(false)

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    setTilt({
      x: (py - 0.5) * -MAX_TILT * 2,
      y: (px - 0.5) * MAX_TILT * 2,
    })
    setGlow({ x: px * 100, y: py * 100 })
  }

  const handleLeave = () => {
    setHovering(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <Link
      ref={cardRef}
      to={`/products/${product.slug}`}
      onMouseEnter={() => setHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovering ? 'scale(1.02)' : 'scale(1)'}`,
        transition: hovering ? 'transform 80ms linear' : 'transform 400ms ease-out',
      }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-surface-1 shadow-sm shadow-black/30 will-change-transform hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/30"
    >
      {hovering && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-70 transition-opacity"
          style={{
            background: `radial-gradient(320px circle at ${glow.x}% ${glow.y}%, rgba(59,130,246,0.18), transparent 60%)`,
          }}
        />
      )}

      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-surface-2">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <ImageOff className="h-8 w-8 text-slate-600" />
        )}
        <div className="animate-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="relative flex flex-1 flex-col gap-2 p-4">
        {product.category?.name && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-400">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-1 font-semibold text-white group-hover:text-brand-300">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{product.short_description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-gradient-gold transition-transform duration-300 group-hover:scale-105">
            {formatCurrency(product.price, product.currency)}
          </span>
          {product.is_purchased && <Badge color="green">Owned</Badge>}
        </div>
      </div>
    </Link>
  )
}
