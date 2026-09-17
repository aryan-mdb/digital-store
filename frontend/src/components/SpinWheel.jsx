import { useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const SEGMENTS = [
  { label: '5% OFF', color: '#3b82f6', text: '#ffffff' },
  { label: 'Try Again', color: '#182030', text: '#7c8aa0' },
  { label: '10% OFF', color: '#60a5fa', text: '#05070d' },
  { label: 'Bonus Badge', color: '#202a3d', text: '#60a5fa' },
  { label: '15% OFF', color: '#2563eb', text: '#ffffff' },
  { label: 'Nothing', color: '#182030', text: '#7c8aa0' },
  { label: '20% OFF', color: '#93c5fd', text: '#05070d' },
  { label: 'Free Spin', color: '#202a3d', text: '#93c5fd' },
]

const SEGMENT_ANGLE = 360 / SEGMENTS.length
const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000
const STORAGE_KEY = 'spinwheel:last-spin'

function formatCountdown(ms) {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return `${h}h ${m}m ${s}s`
}

export default function SpinWheel() {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [nextAvailableAt, setNextAvailableAt] = useState(() => {
    const last = Number(localStorage.getItem(STORAGE_KEY) || 0)
    return last ? last + SPIN_COOLDOWN_MS : 0
  })
  const [now, setNow] = useState(Date.now())
  const wheelRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const locked = spinning || now < nextAvailableAt
  const remainingMs = Math.max(0, nextAvailableAt - now)

  const gradient = useMemo(() => {
    const stops = SEGMENTS.map((seg, i) => {
      const from = i * SEGMENT_ANGLE
      const to = from + SEGMENT_ANGLE
      return `${seg.color} ${from}deg ${to}deg`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [])

  const handleSpin = () => {
    if (locked) return

    setSpinning(true)
    const winnerIndex = Math.floor(Math.random() * SEGMENTS.length)
    // Land the pointer (fixed at top) in the middle of the winning segment,
    // plus several full turns so the spin feels substantial.
    const targetAngle = 360 * 6 + (360 - (winnerIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2))
    const finalRotation = rotation + targetAngle

    setRotation(finalRotation)

    window.setTimeout(() => {
      setSpinning(false)
      const prize = SEGMENTS[winnerIndex]
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
      setNextAvailableAt(Date.now() + SPIN_COOLDOWN_MS)

      if (prize.label === 'Nothing') {
        toast('😬 No luck this time — come back tomorrow!', { icon: '🎡' })
      } else if (prize.label === 'Try Again') {
        toast('🔁 So close! Try again tomorrow.', { icon: '🎡' })
      } else {
        toast.success(`🎉 You won: ${prize.label}!`)
      }
    }, 4200)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/3">
          <div className="h-6 w-6 rotate-180 border-x-[10px] border-b-[16px] border-x-transparent border-b-brand-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.7)]" />
        </div>

        <div className="glow-gold-lg rounded-full border-4 border-brand-500/50 p-2">
          <div
            ref={wheelRef}
            className="relative flex h-64 w-64 items-center justify-center rounded-full sm:h-80 sm:w-80"
            style={{
              background: gradient,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4.2s cubic-bezier(0.17, 0.67, 0.16, 0.99)' : 'none',
            }}
          >
            {SEGMENTS.map((seg, i) => {
              const midAngle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
              const flip = midAngle > 90 && midAngle < 270
              return (
                <span
                  key={seg.label}
                  className="absolute left-1/2 top-1/2 origin-top whitespace-nowrap text-[11px] font-bold sm:text-xs"
                  style={{
                    color: seg.text,
                    transform: `rotate(${midAngle}deg) translateY(-92px) rotate(${flip ? 180 : 0}deg)`,
                  }}
                >
                  {seg.label}
                </span>
              )
            })}
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-brand-400 bg-surface-0 shadow-lg">
          <Sparkles className="h-6 w-6 text-brand-400" />
        </div>
      </div>

      <button
        onClick={handleSpin}
        disabled={locked}
        className="glow-gold relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-8 py-3 text-base font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
      >
        {!locked && <span className="animate-shimmer absolute inset-0" />}
        <span className="relative">
          {spinning ? 'Spinning…' : now < nextAvailableAt ? 'Come back later' : 'Spin the Wheel'}
        </span>
      </button>

      {remainingMs > 0 && !spinning && (
        <p className="text-sm text-slate-500">Next free spin in {formatCountdown(remainingMs)}</p>
      )}

      <p className="max-w-sm text-center text-xs text-slate-600">
        🎮 Demo mini-game for fun &amp; engagement — one free spin per day.
      </p>
    </div>
  )
}
