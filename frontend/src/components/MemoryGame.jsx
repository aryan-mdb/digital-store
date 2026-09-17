import { Bitcoin, BookOpen, Code2, GraduationCap, LayoutTemplate, Palette, RotateCcw, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

const ICONS = [Code2, LayoutTemplate, BookOpen, GraduationCap, Palette, Bitcoin]

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

  const won = matched.length === deck.length

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
    setFlipped((prev) => [...prev, idx])
  }

  const handleRestart = () => {
    setDeck(newDeck())
    setFlipped([])
    setMatched([])
    setMoves(0)
  }

  if (won) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-500/50 bg-brand-500/10">
          <Trophy className="h-10 w-10 text-brand-400" />
        </div>
        <h3 className="text-2xl font-bold text-white">Matched in {moves} moves!</h3>
        <p className="text-slate-500">Great memory — give it another shuffle?</p>
        <button
          onClick={handleRestart}
          className="glow-gold mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3 font-bold text-white transition hover:brightness-110"
        >
          <RotateCcw className="h-4 w-4" /> Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Moves: {moves}</span>
        <span>
          Pairs: {matched.length / 2} / {deck.length / 2}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {deck.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(card.id)
          const isMatched = matched.includes(card.id)
          const Icon = card.Icon

          return (
            <button
              key={card.id}
              onClick={() => handleFlip(idx)}
              className={`flex aspect-square items-center justify-center rounded-xl border text-2xl transition-all duration-300 ${
                isMatched
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : isFlipped
                    ? 'border-brand-500/50 bg-brand-500/10'
                    : 'border-white/10 bg-white/5 hover:border-brand-500/30 hover:bg-white/10'
              }`}
            >
              {isFlipped ? (
                <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${isMatched ? 'text-emerald-400' : 'text-brand-400'}`} />
              ) : (
                <span className="h-2 w-2 rounded-full bg-white/20" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
