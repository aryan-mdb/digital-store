import { Bot, Brain, Lightbulb, Megaphone, RotateCcw, Target, Trophy, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import ScoreSaver from './games/ScoreSaver'

// One icon per LERN topic: AI, marketing, sales, growth, ideas, mindset.
const ICONS = [Bot, Megaphone, Target, TrendingUp, Lightbulb, Brain]
const PAIRS = ICONS.length

// Start at 1000; lose 40 per move beyond a perfect game and 3 per second. Never below 100.
function pointsFor(moves, seconds) {
  return Math.max(100, Math.min(1000, 1000 - (moves - PAIRS) * 40 - seconds * 3))
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function newDeck() {
  return shuffle(
    ICONS.flatMap((Icon, i) => [
      { id: `${i}-a`, iconIndex: i, Icon },
      { id: `${i}-b`, iconIndex: i, Icon },
    ])
  )
}

export default function MemoryGame() {
  const [deck, setDeck] = useState(newDeck)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const [finishedAt, setFinishedAt] = useState(null)
  const [now, setNow] = useState(Date.now)
  const [roundId, setRoundId] = useState(1)

  const won = matched.length === deck.length
  const seconds = startedAt ? Math.floor(((finishedAt ?? now) - startedAt) / 1000) : 0

  useEffect(() => {
    if (!startedAt || finishedAt) return
    const timer = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(timer)
  }, [startedAt, finishedAt])

  useEffect(() => {
    if (won && startedAt && !finishedAt) setFinishedAt(Date.now())
  }, [won, startedAt, finishedAt])

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    setMoves((m) => m + 1)

    if (deck[a].iconIndex === deck[b].iconIndex) {
      setMatched((prev) => [...prev, deck[a].id, deck[b].id])
      setFlipped([])
    } else {
      const timer = setTimeout(() => setFlipped([]), 700)
      return () => clearTimeout(timer)
    }
  }, [flipped, deck])

  const handleFlip = (idx) => {
    if (flipped.length === 2) return
    if (flipped.includes(idx) || matched.includes(deck[idx].id)) return
    if (!startedAt) setStartedAt(Date.now())
    setFlipped((prev) => [...prev, idx])
  }

  const handleRestart = () => {
    setDeck(newDeck())
    setFlipped([])
    setMatched([])
    setMoves(0)
    setStartedAt(null)
    setFinishedAt(null)
    setRoundId((id) => id + 1)
  }

  if (won && finishedAt) {
    const points = pointsFor(moves, seconds)
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-500/50 bg-brand-500/10 shadow-[var(--glow)]">
          <Trophy className="h-10 w-10 text-brand-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{points} points</h3>
        <p className="-mt-2 text-sm text-slate-500">
          {moves} moves · {seconds}s
        </p>
        <p className="text-slate-500">
          {moves <= PAIRS + 2 ? 'Sharp memory — that was nearly perfect! 🧠' : 'All pairs found — fewer moves means more points. 🔁'}
        </p>
        <ScoreSaver game="memory" score={points} details={{ moves, seconds }} roundId={roundId} />
        <button type="button" onClick={handleRestart} className="btn-neon mt-2">
          <RotateCcw className="h-4 w-4" /> Play again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="eyebrow mb-1!">Memory match</p>
        <h3 className="text-2xl font-bold text-slate-900">Find all {PAIRS} pairs</h3>
        <p className="mt-1 text-sm text-slate-500">Fewer moves and a faster time earn more points.</p>
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Moves: {moves}</span>
        <span>Time: {seconds}s</span>
        <span>
          Pairs: {matched.length / 2} / {PAIRS}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {deck.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(card.id)
          const isMatched = matched.includes(card.id)
          const Icon = card.Icon

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(idx)}
              aria-label={isFlipped ? 'Revealed card' : 'Hidden card'}
              className={`flex aspect-square items-center justify-center rounded-xl border transition-all duration-300 ${
                isMatched
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : isFlipped
                    ? 'border-brand-500/60 bg-[var(--neon-soft)] shadow-[var(--glow)]'
                    : 'border-slate-200 bg-slate-100 hover:-translate-y-0.5 hover:border-brand-500/40'
              }`}
            >
              {isFlipped ? (
                <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${isMatched ? 'text-emerald-400' : 'text-brand-500'}`} />
              ) : (
                <span className="font-display text-sm font-bold text-slate-500">L</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
