import { Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { gameService } from '../../services/gameService'

/**
 * Saves a finished round to the leaderboard once and shows where it
 * landed. Guests are asked to log in instead. Changing `roundId` (e.g. a
 * new round with the same score) saves again.
 */
export default function ScoreSaver({ game, score, details, roundId }) {
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'idle' })
  const savedRound = useRef(null)

  useEffect(() => {
    if (!user || savedRound.current === roundId) return
    savedRound.current = roundId
    setState({ status: 'saving' })
    gameService
      .submitScore(game, score, details)
      .then((res) => setState({ status: 'saved', ...res.data }))
      .catch(() => setState({ status: 'error' }))
  }, [user, game, score, details, roundId])

  if (!user) {
    return (
      <p className="text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-brand-500 hover:underline">
          Log in
        </Link>{' '}
        to put your {score} points on the leaderboard.
      </p>
    )
  }

  if (state.status === 'saving') return <p className="text-sm text-slate-500">Saving your score…</p>
  if (state.status === 'error') return <p className="text-sm text-red-400">Couldn’t save your score — check your connection.</p>
  if (state.status !== 'saved') return null

  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm">
      <Trophy className="h-4 w-4 text-brand-500" />
      <span className="text-slate-900">{state.is_new_best ? 'New personal best!' : `Your best: ${state.best}`}</span>
      <span className="text-slate-500">Rank #{state.rank}</span>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('arcade:open', { detail: 'leaderboard' }))} className="font-semibold text-brand-500 hover:underline">
        View leaderboard
      </button>
    </div>
  )
}
