import clsx from 'clsx'
import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Site-wide motion, mounted once at the app root:
 * - scroll reveal for every [data-reveal] element (works on phones too)
 * - ripple on tap/click for buttons and [data-ripple] elements
 * - gold scroll-progress bar and a back-to-top button
 */
export default function MotionEffects() {
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)
  const ticking = useRef(false)

  // Scroll reveal. A MutationObserver picks up cards that render after
  // data loads or a route change, so pages don't need to wire anything.
  useEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
    document.documentElement.classList.add('reveal-ready')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    const observeAll = (root) => {
      root.querySelectorAll?.('[data-reveal]:not(.is-visible)').forEach((el) => io.observe(el))
    }
    observeAll(document)

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && (n.matches?.('[data-reveal]') ? io.observe(n) : observeAll(n))))
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  // Ripple on press (pointerdown feels instant on touch screens).
  useEffect(() => {
    if (prefersReducedMotion()) return
    const onDown = (e) => {
      const el = e.target.closest?.('button:not(:disabled), [data-ripple]')
      if (!el || el.closest('[data-no-ripple]')) return
      const rect = el.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2.2
      const ink = document.createElement('span')
      ink.className = 'ripple-ink'
      ink.style.width = ink.style.height = `${size}px`
      ink.style.left = `${e.clientX - rect.left - size / 2}px`
      ink.style.top = `${e.clientY - rect.top - size / 2}px`
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
      el.style.overflow = 'hidden'
      el.appendChild(ink)
      ink.addEventListener('animationend', () => ink.remove())
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  // Progress bar + back-to-top, throttled to one update per frame.
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
        setShowTop(window.scrollY > 700)
        ticking.current = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  // New page → start at the top (SPA navigation otherwise keeps the old scroll).
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
        <div
          className="h-full origin-left bg-gradient-to-r from-ghee-400 via-brand-500 to-forest-600"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <button
        type="button"
        aria-label="Back to top"
        data-no-ripple
        onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
        className={clsx(
          'fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-forest-700 text-ghee-100 shadow-lg shadow-forest-900/30 transition-all duration-300 hover:-translate-y-1 hover:bg-forest-600',
          showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  )
}
