import { useEffect, useState } from 'react'
import { Gift, Lightbulb, RotateCcw, Sparkles } from 'lucide-react'
import ScoreSaver from './games/ScoreSaver'

// kind: 'discount' | 'tip' | 'miss' — decides which result card and messages show.
// points: what the spin adds to the leaderboard.
const SEGMENTS = [
  { label: '10% OFF', kind: 'discount', fill: '#ff2e4d', points: 100 },
  { label: 'Daily Tip', kind: 'tip', fill: '#18181c', points: 50 },
  { label: '5% OFF', kind: 'discount', fill: '#5c1421', points: 50 },
  { label: 'Try Again', kind: 'miss', fill: '#111114', points: 0 },
  { label: '20% OFF', kind: 'discount', fill: '#ff2e4d', points: 200 },
  { label: 'Daily Tip', kind: 'tip', fill: '#18181c', points: 50 },
  { label: '15% OFF', kind: 'discount', fill: '#5c1421', points: 150 },
  { label: 'So Close', kind: 'miss', fill: '#111114', points: 0 },
]

// A different line is picked each spin so the result never reads the same twice in a row.
const MESSAGES = {
  discount: [
    'Nice spin! Use it on any guide this week.',
    'The wheel likes you today — pick a guide and save.',
    'Lucky you! Your next guide just got cheaper.',
    'Winner! Treat yourself to a new skill.',
  ],
  miss: [
    'Not this time — the wheel resets tomorrow.',
    'Almost had it! Your luck refills with the next spin.',
    'The wheel is shy today. Give it another go.',
    'No prize, but every expert started with a miss.',
  ],
}

const TIPS = [
  'Learn: spend 20 focused minutes a day on one skill — consistency beats cramming.',
  'Earn: sell the outcome, not the feature. People buy results.',
  'Return: write down why you started. Read it when motivation dips.',
  'Nurture: stack a new habit onto one you already have.',
  'AI tip: automate the task you repeat most every week first.',
  'Marketing tip: test one change at a time so you know what worked.',
  'Sales tip: ask one more question before you pitch.',
  'Mindset tip: progress you can measure is progress you can keep.',
]

const SIZE = 320
const RADIUS = 150
const SEGMENT_ANGLE = 360 / SEGMENTS.length
const SPINS_PER_DAY = 3
const SPIN_MS = 4600
const STORAGE_KEY = 'spinwheel:spins'

const pick = (list, avoid) => {
  const options = list.length > 1 ? list.filter((item) => item !== avoid) : list
  return options[Math.floor(Math.random() * options.length)]
}

function readSpins() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    const today = new Date().toDateString()
    return saved?.day === today ? saved.count : 0
  } catch {
    return 0
  }
}

function saveSpins(count) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: new Date().toDateString(), count }))
  } catch {
    // storage unavailable — spins just won't persist
  }
}

// Point on the rim, with 0° at the top and angles growing clockwise.
function polar(angle, r = RADIUS) {
  const rad = ((angle - 90) * Math.PI) / 180
  return [r * Math.cos(rad), r * Math.sin(rad)]
}

function slicePath(i) {
  const [x1, y1] = polar(i * SEGMENT_ANGLE)
  const [x2, y2] = polar((i + 1) * SEGMENT_ANGLE)
  return `M0 0 L${x1} ${y1} A${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`
}

export default function SpinWheel() {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [spinsUsed, setSpinsUsed] = useState(readSpins)
  const [result, setResult] = useState(null)

  // Reset the counter if the page stays open past midnight.
  useEffect(() => {
    const timer = setInterval(() => setSpinsUsed(readSpins()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const spinsLeft = Math.max(0, SPINS_PER_DAY - spinsUsed)
  const locked = spinning || spinsLeft === 0

  const handleSpin = () => {
    if (locked) return

    setSpinning(true)
    setResult(null)
    const winner = Math.floor(Math.random() * SEGMENTS.length)
    // The pointer is fixed at the top: turn so the winner's centre (plus a
    // little jitter inside the slice) ends under it, after six full turns.
    const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE - 10)
    const target = 360 - (winner * SEGMENT_ANGLE + SEGMENT_ANGLE / 2 + jitter)
    const current = ((rotation % 360) + 360) % 360
    setRotation(rotation + 360 * 6 + ((target - current + 360) % 360))

    window.setTimeout(() => {
      const prize = SEGMENTS[winner]
      const used = spinsUsed + 1
      saveSpins(used)
      setSpinsUsed(used)
      setSpinning(false)
      setResult((prev) => ({
        ...prize,
        id: Date.now(),
        text: prize.kind === 'tip' ? pick(TIPS, prev?.text) : pick(MESSAGES[prize.kind], prev?.text),
      }))
    }, SPIN_MS)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="eyebrow mb-1!">Daily spin</p>
        <h3 className="text-2xl font-bold text-slate-900">Spin. Win. Learn something.</h3>
        <p className="mt-1 text-sm text-slate-500">Land a discount, a quick tip — or try your luck again.</p>
      </div>

      <div className="relative w-full max-w-[320px]">
        {/* Pointer */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-2 drop-shadow-[0_0_10px_rgba(255,46,77,0.8)]">
          <svg width="30" height="36" viewBox="0 0 30 36" aria-hidden="true">
            <path d="M15 36 L2 8 A13 13 0 1 1 28 8 Z" fill="#ff2e4d" />
            <circle cx="15" cy="12" r="4.5" fill="#08080a" />
          </svg>
        </div>

        <div className="rounded-full p-2 shadow-[0_0_0_1px_#26262c,0_0_40px_-6px_rgba(255,46,77,0.55)]">
          <svg
            viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`}
            className="block h-auto w-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.7, 0.1, 1)` : 'none',
            }}
            role="img"
            aria-label="Prize wheel"
          >
            <circle r={RADIUS + 8} fill="#0d0d10" stroke="#26262c" strokeWidth="2" />
            {SEGMENTS.map((seg, i) => {
              const mid = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
              const dark = seg.fill === '#111114' || seg.fill === '#18181c'
              // Labels on the left half are turned round so they never read upside down.
              const leftHalf = mid > 180
              return (
                <g key={i}>
                  <path d={slicePath(i)} fill={seg.fill} stroke="#26262c" strokeWidth="1.5" />
                  <g transform={`rotate(${leftHalf ? mid + 90 : mid - 90})`}>
                    <text
                      x={leftHalf ? -(RADIUS - 16) : RADIUS - 16}
                      y="0"
                      textAnchor={leftHalf ? 'start' : 'end'}
                      dominantBaseline="middle"
                      fill={dark ? '#ececf1' : '#ffffff'}
                      style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em' }}
                    >
                      {seg.label}
                    </text>
                  </g>
                </g>
              )
            })}
            {/* Rim lights */}
            {SEGMENTS.map((_, i) => {
              const [x, y] = polar(i * SEGMENT_ANGLE, RADIUS + 4)
              return <circle key={i} cx={x} cy={y} r="3" fill="#ff2e4d" />
            })}
          </svg>
        </div>

        {/* Hub */}
        <button
          type="button"
          onClick={handleSpin}
          disabled={locked}
          aria-label="Spin the wheel"
          className="absolute left-1/2 top-1/2 flex h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-brand-500 bg-surface-0 font-display text-sm font-bold text-white shadow-[var(--glow)] transition enabled:hover:scale-105 disabled:cursor-not-allowed"
        >
          {spinning ? <Sparkles className="h-5 w-5 animate-spin text-brand-500" /> : 'SPIN'}
        </button>
      </div>

      <button type="button" onClick={handleSpin} disabled={locked} className="btn-neon disabled:cursor-not-allowed disabled:opacity-50">
        {spinning ? 'Spinning…' : spinsLeft === 0 ? 'Come back tomorrow' : 'Spin the wheel'}
      </button>

      <p className="text-sm text-slate-500">
        {spinsLeft} of {SPINS_PER_DAY} spins left today
      </p>

      {result && (
        <div
          key={result.text}
          className={`animate-pop-in w-full rounded-[14px] border p-5 text-center ${
            result.kind === 'miss' ? 'border-slate-200 bg-slate-100' : 'border-brand-500/50 bg-[var(--neon-soft)]'
          }`}
        >
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-brand-500/50 text-brand-500">
            {result.kind === 'discount' ? <Gift className="h-5 w-5" /> : result.kind === 'tip' ? <Lightbulb className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
          </div>
          <p className="font-display text-xl font-bold text-slate-900">
            {result.kind === 'discount' ? `You won ${result.label}!` : result.kind === 'tip' ? 'Your tip for today' : result.label}
          </p>
          <p className="mt-1 text-sm text-slate-500">{result.text}</p>
          {result.points > 0 && (
            <div className="mt-3">
              <p className="mb-2 font-display text-sm font-bold text-brand-500">+{result.points} points</p>
              <ScoreSaver game="spin" score={result.points} details={{ prize: result.label }} roundId={result.id} />
            </div>
          )}
        </div>
      )}

      <p className="max-w-sm text-center text-xs text-slate-500">Demo mini-game for fun — prizes are not applied at checkout.</p>
    </div>
  )
}
