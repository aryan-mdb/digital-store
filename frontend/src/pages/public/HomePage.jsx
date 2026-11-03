import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import SectionHeading from '../../components/ui/SectionHeading'
import { SITE } from '../../config/site'
import { productService } from '../../services/productService'
import { unwrapPaginated } from '../../utils/pagination'
import usePageMeta from '../../hooks/usePageMeta'

export default function HomePage() {
  usePageMeta(null, 'Digital guides on AI automation, marketing, sales, self-development and more.')
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    productService.list({ per_page: 8, sort: 'newest' }).then((res) => {
      const { items, meta } = unwrapPaginated(res)
      setProducts(items)
      setTotal(meta?.total ?? items.length)
    })
  }, [])

  // Product names scroll in the marquee; the pillars stand in until products load.
  const marqueeItems = products.length > 0 ? products.map((p) => p.name) : SITE.pillars.map((p) => `${p.word} ${p.rest}`)

  return (
    <div>
      {/* Hero */}
      <section className="relative flex items-center overflow-hidden pb-[88px] pt-[72px] sm:min-h-[calc(100vh-70px)] sm:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="hero-grid" />
          <div className="hero-orb" />
        </div>
        <div className="relative mx-auto w-full max-w-[1160px] px-5">
          <p className="eyebrow">{SITE.name}</p>
          <h1 className="mb-7 text-[clamp(2.4rem,7vw,5.2rem)] font-bold">
            {SITE.pillars.map((p, i) => (
              <span key={p.word} className="hero-line" style={{ animationDelay: `${i * 0.15}s` }}>
                <span className="hero-initial">{p.word[0]}</span>
                {p.word.slice(1)} <span className="font-medium text-slate-500">{p.rest}</span>
              </span>
            ))}
          </h1>
          <p className="hero-fade mb-9 max-w-[52ch] text-[1.15rem] text-slate-500" style={{ animationDelay: '0.6s' }}>
            {SITE.lead}
          </p>
          <div className="hero-fade flex flex-wrap gap-3" style={{ animationDelay: '0.75s' }}>
            <Link to="/products" className="btn-neon flex-1 sm:flex-none">
              Explore the guides →
            </Link>
            <Link to="/dashboard/refer-earn" className="btn-ghost-neon flex-1 sm:flex-none">
              Become an affiliate
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-slate-200 bg-surface-1 py-[18px]" aria-hidden="true">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((name, i) => (
            <span key={i}>{name}</span>
          ))}
        </div>
      </div>

      {/* The method */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1160px] px-5">
          <SectionHeading eyebrow="The method" title="Four steps. One direction." subtitle="Every guide maps to one part of the journey." />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SITE.pillars.map((p, i) => (
              <div key={p.word} className="border-t border-slate-200 pt-[22px]" data-reveal="up" style={{ '--reveal-delay': `${i * 110}ms` }}>
                <div className="font-display text-5xl font-bold leading-none text-neon">{p.word[0]}</div>
                <h3 className="mb-1.5 mt-3.5 text-xl font-bold">{p.word}</h3>
                <p className="text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {products.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[1160px] px-5">
            <SectionHeading eyebrow="Featured" title="Start with these" subtitle="Our most popular guides right now." />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} revealDelay={(i % 4) * 110} />
              ))}
            </div>
            <p className="mt-8" data-reveal="up">
              <Link to="/products" className="btn-ghost-neon">
                See all {total} guides →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Affiliate CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1160px] px-5">
          <div className="cta-glow rounded-[20px] border border-slate-200 px-6 py-[72px] text-center" data-reveal="up">
            <p className="eyebrow">Affiliate program</p>
            <h2 className="mb-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold">
              Share {SITE.shortName}. <span className="text-neon">Earn</span> on every sale.
            </h2>
            <p className="mx-auto mb-7 max-w-[50ch] text-slate-500">
              Every account gets a personal referral link and code — earn a reward each time someone buys through it.
            </p>
            <Link to="/dashboard/refer-earn" className="btn-neon">
              How it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
