import { Brain, Gamepad2, HelpCircle, Lock, Sparkles, Trophy } from 'lucide-react'
import { useState } from 'react'
import SpinWheel from '../../components/SpinWheel'
import QuizGame from '../../components/QuizGame'
import MemoryGame from '../../components/MemoryGame'
import usePageMeta from '../../hooks/usePageMeta'

const GAMES = [
  { key: 'spin', label: 'Spin Wheel', icon: Gamepad2, Component: SpinWheel },
  { key: 'quiz', label: 'Quiz Challenge', icon: HelpCircle, Component: QuizGame },
  { key: 'memory', label: 'Memory Match', icon: Brain, Component: MemoryGame },
]

const comingSoon = [{ icon: Trophy, title: 'Weekly Leaderboard', desc: 'Compete with other players.' }]

export default function GamingPage() {
  usePageMeta(
    'Gaming Arcade',
    'Play the daily spin wheel, test your knowledge in the quiz challenge, or race the clock in memory match — free mini-games on DigitalMarketplace.'
  )
  const [active, setActive] = useState('spin')
  const ActiveGame = GAMES.find((g) => g.key === active)?.Component

  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 h-[32rem]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="mb-10 text-center">
          <span className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-300">
            <Gamepad2 className="h-3.5 w-3.5" /> Arcade
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            Gaming <span className="text-gradient-gold">Arcade</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            Take a break, play a round and earn bragging rights. New games added regularly.
          </p>
        </div>

        <div className="mx-auto mb-8 flex max-w-xl flex-wrap justify-center gap-2">
          {GAMES.map((game) => (
            <button
              key={game.key}
              onClick={() => setActive(game.key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                active === game.key
                  ? 'border-brand-500/50 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-brand-500/30 hover:bg-white/10'
              }`}
            >
              <game.icon className="h-4 w-4" /> {game.label}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-surface-1 p-6 shadow-lg shadow-black/30 sm:p-10">
          {ActiveGame && <ActiveGame />}
        </div>

        <div className="mt-16">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
            <Sparkles className="h-5 w-5 text-brand-400" /> More games, coming soon
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {comingSoon.map((game) => (
              <div
                key={game.title}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-surface-1 p-5 opacity-70"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
                  <game.icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-white">{game.title}</p>
                <p className="mt-1 text-sm text-slate-500">{game.desc}</p>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  <Lock className="h-3 w-3" /> Soon
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
