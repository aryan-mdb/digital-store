import clsx from 'clsx'
import { ChevronLeft, ChevronRight, CreditCard, MapPin, MessageCircle, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { siteService } from '../services/siteService'
import { whatsappLink } from '../utils/whatsapp'

const SLIDE_MS = 6000

/**
 * Homepage hero carousel. Shows the admin's uploaded slides; when there
 * are none (or they fail to load) it falls back to built-in animated
 * slides so the homepage never looks empty.
 */
export default function HeroSlider() {
  const [remoteSlides, setRemoteSlides] = useState(null)
  const settings = useSiteSettings()

  useEffect(() => {
    siteService
      .sliders()
      .then((res) => setRemoteSlides(res.data.filter((s) => s.image_url)))
      .catch(() => setRemoteSlides([]))
  }, [])

  const defaultSlides = useMemo(() => buildDefaultSlides(settings), [settings])

  if (remoteSlides === null) {
    return <div className="bg-maroon-velvet h-[440px] sm:h-[520px]" />
  }

  return <Carousel slides={remoteSlides.length > 0 ? remoteSlides : defaultSlides} />
}

function Carousel({ slides }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef(null)
  const count = slides.length

  useEffect(() => {
    if (active >= count) setActive(0)
  }, [count, active])

  const go = (i) => setActive(((i % count) + count) % count)

  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX)
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1))
    touchX.current = null
  }

  return (
    <section
      className="relative h-[440px] overflow-hidden sm:h-[520px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={clsx(
            'absolute inset-0 transition-opacity duration-700 ease-out',
            i === active ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
          )}
          aria-hidden={i !== active}
        >
          {slide.image_url ? <ImageSlide slide={slide} isActive={i === active} /> : <DefaultSlide slide={slide} isActive={i === active} />}
        </div>
      ))}

      {count > 1 && (
        <>
          <button
            onClick={() => go(active - 1)}
            aria-label="Previous slide"
            className="absolute bottom-5 right-20 z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-brand-300/40 bg-black/25 text-brand-100 backdrop-blur transition hover:bg-black/40 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(active + 1)}
            aria-label="Next slide"
            className="absolute bottom-5 right-6 z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-brand-300/40 bg-black/25 text-brand-100 backdrop-blur transition hover:bg-black/40 sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={clsx(
                  'relative h-2 overflow-hidden rounded-full bg-brand-100/30 transition-all',
                  i === active ? 'w-10' : 'w-2 hover:bg-brand-100/60'
                )}
              >
                {i === active && (
                  <span
                    key={active}
                    className="absolute inset-0 origin-left bg-brand-300"
                    style={{
                      animation: `slide-progress ${SLIDE_MS}ms linear forwards`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
                    onAnimationEnd={() => go(active + 1)}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="ornament-band absolute inset-x-0 bottom-0 z-20" />
    </section>
  )
}

function SlideCta({ slide, className }) {
  if (!slide.button_text || !slide.button_link) return null
  const classes = clsx(
    'glow-gold relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gold-foil px-6 py-3 font-bold text-maroon-900 transition hover:brightness-105',
    className
  )
  const inner = (
    <>
      <span className="animate-shimmer absolute inset-0" />
      <span className="relative">{slide.button_text}</span>
    </>
  )
  return /^https?:\/\//.test(slide.button_link) ? (
    <a href={slide.button_link} target="_blank" rel="noreferrer" className={classes}>
      {inner}
    </a>
  ) : (
    <Link to={slide.button_link} className={classes}>
      {inner}
    </Link>
  )
}

function ImageSlide({ slide, isActive }) {
  const hasText = slide.title || slide.subtitle || slide.button_text

  return (
    <div className="relative h-full w-full bg-maroon-900">
      <img
        src={slide.image_url}
        alt={slide.title || 'Banner'}
        className={clsx('h-full w-full object-cover object-[76%_center] sm:object-center', isActive && 'animate-ken-burns')}
      />
      {hasText && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a0b07]/85 via-[#2a0b07]/45 to-transparent" />
          <div className="absolute inset-0 mx-auto flex max-w-7xl items-center px-6 sm:px-12">
            <div className="max-w-xl">
              {slide.title && (
                <h2 className={clsx('text-3xl font-extrabold leading-tight text-[#fdf3dc] sm:text-5xl', isActive && 'animate-fade-up')}>
                  {slide.title}
                </h2>
              )}
              {slide.subtitle && (
                <p
                  className={clsx('mt-4 text-base text-[#f1dfb8] sm:text-lg', isActive && 'animate-fade-up')}
                  style={{ animationDelay: '120ms' }}
                >
                  {slide.subtitle}
                </p>
              )}
              <div className={clsx('mt-7', isActive && 'animate-fade-up')} style={{ animationDelay: '240ms' }}>
                <SlideCta slide={slide} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function DefaultSlide({ slide, isActive }) {
  const Icon = slide.icon

  return (
    <div className="bg-maroon-velvet relative h-full w-full overflow-hidden">
      {/* rising gold motes */}
      <div className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="animate-rise absolute bottom-[-20px] rounded-full bg-brand-300/70 blur-[1px]"
            style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
          />
        ))}
      </div>

      <Mandala className="animate-spin-slow pointer-events-none absolute -right-28 top-1/2 h-[560px] w-[560px] -translate-y-1/2 opacity-40 sm:right-[-60px] lg:right-10 lg:opacity-60" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 sm:px-12">
        <div className="max-w-2xl">
          {slide.eyebrow && (
            <span
              className={clsx(
                'mb-5 inline-flex items-center gap-2 rounded-full border border-brand-300/40 bg-brand-300/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200',
                isActive && 'animate-fade-up'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" /> {slide.eyebrow}
            </span>
          )}
          <h2
            className={clsx('text-4xl font-extrabold leading-[1.1] text-[#fdf3dc] sm:text-6xl', isActive && 'animate-fade-up')}
            style={{ animationDelay: '100ms' }}
          >
            {slide.title} <span className="text-foil-bright">{slide.highlight}</span>
          </h2>
          <p
            className={clsx('mt-5 max-w-lg text-base text-[#f1dfb8]/90 sm:text-lg', isActive && 'animate-fade-up')}
            style={{ animationDelay: '220ms' }}
          >
            {slide.subtitle}
          </p>
          <div className={clsx('mt-8', isActive && 'animate-fade-up')} style={{ animationDelay: '340ms' }}>
            <SlideCta slide={slide} />
          </div>
        </div>
      </div>

      {Icon && (
        <div className="pointer-events-none absolute right-[12%] top-1/2 hidden -translate-y-1/2 lg:block">
          <div className={clsx('relative', isActive && 'animate-float-slow')}>
            <div className="bg-gold-foil flex h-40 w-40 items-center justify-center rounded-full shadow-2xl shadow-black/50">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-maroon-700/40 bg-maroon-700">
                <Icon className="h-14 w-14 text-brand-200" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Gold rangoli-style medallion, drawn inline so it costs no requests. */
function Mandala({ className }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5)
  const inner = Array.from({ length: 8 }, (_, i) => i * 45)
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g fill="none" stroke="#e6c35c" strokeWidth="0.6">
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="90" strokeDasharray="2 3" />
        <circle cx="100" cy="100" r="62" />
        <circle cx="100" cy="100" r="30" />
        <circle cx="100" cy="100" r="22" strokeDasharray="1 2" />
        {petals.map((deg) => (
          <ellipse key={deg} cx="100" cy="42" rx="9" ry="24" transform={`rotate(${deg} 100 100)`} />
        ))}
        {inner.map((deg) => (
          <path key={deg} d="M100 70 Q110 85 100 100 Q90 85 100 70 Z" transform={`rotate(${deg} 100 100)`} />
        ))}
        {petals.map((deg) => (
          <circle key={`d${deg}`} cx="100" cy="7" r="1.6" fill="#e6c35c" transform={`rotate(${deg + 11.25} 100 100)`} />
        ))}
      </g>
    </svg>
  )
}

// Deterministic so server/first render and re-renders match.
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 3 + ((i * 7) % 6),
  dur: 9 + ((i * 5) % 8),
  delay: -((i * 1.7) % 12),
}))

function buildDefaultSlides({ payment_methods: methods = {}, whatsapp = {} }) {
  const payBits = [
    methods.razorpay && 'UPI, cards & netbanking via Razorpay',
    methods.cod && 'Cash on Delivery',
    methods.crypto && 'crypto',
  ].filter(Boolean)

  const slides = [
    {
      id: 'd-tradition',
      eyebrow: 'पवित्र स्वाद • शुद्धता का भरोसा',
      title: 'PAYAN',
      highlight: 'Pure Cow Ghee',
      subtitle: 'Hand-churned the bilona way from the milk of grass-fed desi cows — golden, granular and full of aroma.',
      button_text: 'Shop Ghee',
      button_link: '/products',
      icon: Sparkles,
    },
    {
      id: 'd-pay',
      eyebrow: 'Easy & secure checkout',
      title: 'Pay the way',
      highlight: 'you like',
      subtitle: payBits.length ? `Choose ${payBits.join(', ').replace(/, ([^,]*)$/, ' or $1')}.` : 'Fast, secure checkout.',
      button_text: 'Start Shopping',
      button_link: '/products',
      icon: CreditCard,
    },
    {
      id: 'd-track',
      eyebrow: 'Live order tracking',
      title: 'Know exactly where',
      highlight: 'your order is',
      subtitle: 'Follow every step — packed, shipped, out for delivery — with live location on the map.',
      button_text: 'Track Your Order',
      button_link: '/track',
      icon: MapPin,
    },
  ]

  if (whatsapp.enabled) {
    slides.push({
      id: 'd-whatsapp',
      eyebrow: 'We are here to help',
      title: 'Questions? Chat with us on',
      highlight: 'WhatsApp',
      subtitle: 'Order help, product advice or delivery updates — just send us a message.',
      button_text: 'Chat on WhatsApp',
      button_link: whatsappLink(whatsapp.number, whatsapp.message),
      icon: MessageCircle,
    })
  }

  return slides
}
