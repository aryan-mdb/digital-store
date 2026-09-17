import { Coins, Dices, Gamepad2, Lock, Sparkles, Trophy } from 'lucide-react'
import SpinWheel from '../../components/SpinWheel'

const comingSoon = [
  { icon: Dices, title: 'Lucky Dice', desc: 'Roll for a surprise reward.' },
  { icon: Coins, title: 'Scratch Card', desc: 'Scratch to reveal a prize.' },
  { icon: Trophy, title: 'Weekly Leaderboard', desc: 'Compete with other players.' },
]

export default function GamingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 h-[32rem]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="mb-12 text-center">
          <span className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-300">
            <Gamepad2 className="h-3.5 w-3.5" /> Arcade
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            Spin the <span className="text-gradient-gold">Wheel</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            Take a daily spin for a shot at exclusive rewards. Come back every day — the wheel
            resets in 24 hours.
          </p>
        </div>

        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-surface-1 p-6 shadow-lg shadow-black/30 sm:p-10">
          <SpinWheel />
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
