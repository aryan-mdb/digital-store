import { ArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'
import Badge from './ui/Badge'
import ImagePlaceholder from './ui/ImagePlaceholder'

const MAX_TILT = 8

export default function ProductCard({ product, revealDelay = 0 }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const [hovering, setHovering] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const [pressed, setPressed] = useState(false)

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

  const scale = pressed ? 'scale(0.97)' : hovering ? 'scale(1.02)' : 'scale(1)'

  return (
    <div data-reveal="up" style={{ '--reveal-delay': `${revealDelay}ms` }} className="h-full">
    <Link
      ref={cardRef}
      data-ripple
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      to={`/products/${product.slug}`}
      onMouseEnter={() => setHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        handleLeave()
        setPressed(false)
      }}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${scale}`,
        transition: hovering && !pressed ? 'transform 80ms linear' : 'transform 300ms ease-out',
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-surface-1 shadow-sm shadow-forest-900/10 will-change-transform hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/30"
    >
      {hovering && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-70 transition-opacity"
          style={{
            background: `radial-gradient(320px circle at ${glow.x}% ${glow.y}%, rgba(216,171,56,0.22), transparent 60%)`,
          }}
        />
      )}

      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-surface-2">
        {product.thumbnail_url && !imgFailed ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="animate-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute bottom-3 right-3 inline-flex translate-y-3 items-center gap-1 rounded-full bg-forest-700 px-3 py-1 text-xs font-semibold text-ghee-100 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>

      <div className="relative flex flex-1 flex-col gap-2 p-4">
        {product.category?.name && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-brand-600">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{product.short_description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-gradient-gold transition-transform duration-300 group-hover:scale-105">
            {formatCurrency(product.price, product.currency)}
          </span>
          {product.is_purchased && <Badge color="green">Owned</Badge>}
        </div>
      </div>
    </Link>
    </div>
  )
}
