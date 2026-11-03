import { Crown, Medal, RefreshCw, Trophy } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { gameService } from '../../services/gameService'

const GAMES = [
  { key: 'all', label: 'Overall' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'memory', label: 'Memory' },
  { key: 'spin', label: 'Spin' },
]

const PERIODS = [
  { key: 'week', label: 'This week' },
  { key: 'all', label: 'All time' },
]

// Podium order on screen: 2nd, 1st, 3rd.
const PODIUM = [
  { place: 2, height: 'h-20', icon: Medal },
  { place: 1, height: 'h-28', icon: Crown },
  { place: 3, height: 'h-14', icon: Medal },
]

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[0.85rem] transition-all ${
        active ? 'border-brand-500 bg-[var(--neon-soft)] text-white shadow-[var(--glow)]' : 'border-slate-200 text-slate-500 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [game, setGame] = useState('all')
  const [period, setPeriod] = useState('week')
  const [board, setBoard] = useState(null)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    setError(false)
    return gameService
      .leaderboard({ game, period })
      .then((res) => setBoard(res.data))
      .catch(() => setError(true))
  }, [game, period])

  useEffect(() => {
    setBoard(null)
    load()
  }, [load])

  const entries = board?.entries ?? []
  const meInTop = entries.some((e) => e.is_me)

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="eyebrow mb-1!">Leaderboard</p>
        <h3 className="text-2xl font-bold text-slate-900">Top players</h3>
        <p className="mt-1 text-sm text-slate-500">
          {game === 'all' ? 'Overall = your best round in each game, added up.' : 'Ranked by each player’s best round.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {GAMES.map((g) => (
          <Chip key={g.key} active={game === g.key} onClick={() => setGame(g.key)}>
            {g.label}
          </Chip>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        {PERIODS.map((p) => (
          <Chip key={p.key} active={period === p.key} onClick={() => setPeriod(p.key)}>
            {p.label}
          </Chip>
        ))}
        <button type="button" onClick={load} aria-label="Refresh" className="ml-1 rounded-full p-2 text-slate-500 hover:text-slate-900">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error ? (
        <p className="py-8 text-center text-sm text-slate-500">Couldn’t load the leaderboard. Try refreshing.</p>
      ) : !board ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="py-8 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          <p className="font-semibold text-slate-900">No scores yet {period === 'week' ? 'this week' : ''}</p>
          <p className="mt-1 text-sm text-slate-500">Play a round and claim the top spot.</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="grid grid-cols-3 items-end gap-2 sm:gap-3">
            {PODIUM.map(({ place, height, icon: Icon }) => {
              const e = entries[place - 1]
              return (
                <div key={place} className="flex min-w-0 flex-col items-center text-center">
                  {e ? (
                    <>
                      <Icon className={`mb-1 h-5 w-5 ${place === 1 ? 'text-brand-500 drop-shadow-[0_0_8px_rgba(255,46,77,0.8)]' : 'text-slate-500'}`} />
                      <p className={`w-full truncate text-sm font-semibold ${e.is_me ? 'text-brand-500' : 'text-slate-900'}`}>{e.name}</p>
                      <p className="font-display text-lg font-bold text-slate-900">{e.points}</p>
                    </>
                  ) : (
                    <p className="mb-2 text-xs text-slate-500">—</p>
                  )}
                  <div
                    className={`${height} mt-2 flex w-full items-start justify-center rounded-t-xl border border-b-0 pt-2 font-display text-xl font-bold ${
                      place === 1 ? 'border-brand-500/60 bg-[var(--neon-soft)] text-brand-500 shadow-[var(--glow)]' : 'border-slate-200 bg-slate-100 text-slate-500'
                    }`}
                  >
                    {place}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Full list */}
          <ol className="divide-y divide-slate-100 overflow-hidden rounded-[14px] border border-slate-200">
            {entries.map((e) => (
              <li key={e.rank} className={`flex items-center gap-3 px-4 py-3 ${e.is_me ? 'bg-[var(--neon-soft)]' : ''}`}>
                <span className={`w-7 font-display font-bold ${e.rank <= 3 ? 'text-brand-500' : 'text-slate-500'}`}>#{e.rank}</span>
                <span className="min-w-0 flex-1 truncate text-slate-900">
                  {e.name}
                  {e.is_me && <span className="ml-2 text-xs font-semibold text-brand-500">You</span>}
                </span>
                <span className="hidden text-xs text-slate-500 sm:inline">{e.plays} rounds</span>
                <span className="w-16 text-right font-display font-bold text-slate-900">{e.points}</span>
              </li>
            ))}
          </ol>

          <p className="text-center text-xs text-slate-500">{board.players} players {period === 'week' ? 'this week' : 'in total'}</p>
        </>
      )}

      {board && !meInTop && (
        <div className="rounded-[14px] border border-slate-200 bg-slate-100 px-4 py-3 text-center text-sm">
          {board.me ? (
            <span className="text-slate-900">
              You’re <strong className="text-brand-500">#{board.me.rank}</strong> with {board.me.points} points — keep playing to climb.
            </span>
          ) : user ? (
            <span className="text-slate-500">You haven’t played {period === 'week' ? 'this week' : 'yet'} — finish a round to get ranked.</span>
          ) : (
            <span className="text-slate-500">
              <Link to="/login" className="font-semibold text-brand-500 hover:underline">
                Log in
              </Link>{' '}
              to save your scores and see your rank.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
