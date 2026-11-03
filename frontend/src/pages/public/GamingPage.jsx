import { Brain, Gamepad2, HelpCircle, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import SpinWheel from '../../components/SpinWheel'
import QuizGame from '../../components/QuizGame'
import MemoryGame from '../../components/MemoryGame'
import Leaderboard from '../../components/games/Leaderboard'
import usePageMeta from '../../hooks/usePageMeta'

const GAMES = [
  { key: 'spin', label: 'Spin Wheel', icon: Gamepad2, Component: SpinWheel },
  { key: 'quiz', label: 'Quiz Challenge', icon: HelpCircle, Component: QuizGame },
  { key: 'memory', label: 'Memory Match', icon: Brain, Component: MemoryGame },
  { key: 'leaderboard', label: 'Leaderboard', icon: Trophy, Component: Leaderboard },
]

const isTab = (key) => GAMES.some((g) => g.key === key)

export default function GamingPage() {
  usePageMeta(
    'Gaming Arcade',
    'Play the daily spin wheel, test your knowledge in the quiz challenge, or race the clock in memory match — then climb the leaderboard on LERN.'
  )
  const [active, setActive] = useState(() => (isTab(location.hash.slice(1)) ? location.hash.slice(1) : 'spin'))
  const ActiveGame = GAMES.find((g) => g.key === active)?.Component

  // Games link to the leaderboard from their result screens.
  useEffect(() => {
    const open = (e) => isTab(e.detail) && setActive(e.detail)
    window.addEventListener('arcade:open', open)
    return () => window.removeEventListener('arcade:open', open)
  }, [])

  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 h-[32rem]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="mb-10 text-center">
          <p className="eyebrow">Play</p>
          <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-bold text-slate-900">
            Learn by <span className="text-neon">playing.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-500">
            Spin for a daily tip, test yourself on a subject, or train your memory — then see where you rank.
          </p>
        </div>

        <div className="mx-auto mb-8 flex max-w-2xl flex-wrap justify-center gap-2">
          {GAMES.map((game) => (
            <button
              key={game.key}
              type="button"
              onClick={() => setActive(game.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-[18px] py-2 text-[0.92rem] font-medium transition-all ${
                active === game.key
                  ? 'border-brand-500 bg-[var(--neon-soft)] text-white shadow-[var(--glow)]'
                  : 'border-slate-200 text-slate-500 hover:border-slate-500 hover:text-slate-900'
              }`}
            >
              <game.icon className="h-4 w-4" /> {game.label}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-xl rounded-[20px] border border-slate-200 bg-surface-1 p-6 shadow-[0_30px_80px_-30px_rgba(255,46,77,0.35)] sm:p-10">
          {ActiveGame && <ActiveGame />}
        </div>
      </div>
    </div>
  )
}
