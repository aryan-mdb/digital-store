import { Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'

const QUESTIONS = [
  {
    q: 'What do you need to buy a product on DigitalMarketplace?',
    options: ['A credit card', 'Cryptocurrency', 'A gift card', 'Cash on delivery'],
    answer: 1,
  },
  {
    q: 'Which of these is NOT a product category on the site?',
    options: ['Software', 'Ebooks', 'Furniture', 'Graphics'],
    answer: 2,
  },
  {
    q: 'When is a digital product unlocked for download?',
    options: [
      'Immediately after adding to cart',
      'After the payment is confirmed',
      'Only after emailing support',
      'Never — it ships physically',
    ],
    answer: 1,
  },
  {
    q: 'Which cryptocurrency is commonly used for payments?',
    options: ['USDT', 'Monopoly money', 'Airline miles', 'Gift points'],
    answer: 0,
  },
  {
    q: 'What can you use your wallet balance for?',
    options: ['Nothing, it\'s just for show', 'Covering part or all of a purchase', 'Only withdrawing', 'Only referrals'],
    answer: 1,
  },
  {
    q: 'How do you earn referral rewards?',
    options: [
      'By spinning the wheel',
      'By inviting friends who make a purchase',
      'By logging in daily',
      'By leaving a review',
    ],
    answer: 1,
  },
]

function shuffledIndices(length) {
  const arr = Array.from({ length }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function QuizGame() {
  const [order] = useState(() => shuffledIndices(QUESTIONS.length))
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [finished, setFinished] = useState(false)

  const question = QUESTIONS[order[step]]
  const isLast = step === order.length - 1

  const handleSelect = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === question.answer) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (isLast) {
      setFinished(true)
      return
    }
    setStep((s) => s + 1)
    setSelected(null)
  }

  const handleRestart = () => {
    setStep(0)
    setScore(0)
    setSelected(null)
    setFinished(false)
  }

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100)
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-500/50 bg-brand-500/10">
          <Award className="h-10 w-10 text-brand-400" />
        </div>
        <h3 className="text-2xl font-bold text-white">
          {score} / {QUESTIONS.length} correct
        </h3>
        <p className="text-slate-500">
          {pct >= 80
            ? "Legend status — you know this store inside out! 🏆"
            : pct >= 50
              ? 'Solid effort! A few more spins and you\'ll be an expert. 🎯'
              : "Not bad — try again and beat your score! 🔁"}
        </p>
        <button
          onClick={handleRestart}
          className="glow-gold mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3 font-bold text-surface-0 transition hover:brightness-110"
        >
          <RotateCcw className="h-4 w-4" /> Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>
          Question {step + 1} / {order.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300"
          style={{ width: `${((step + (selected !== null ? 1 : 0)) / order.length) * 100}%` }}
        />
      </div>

      <h3 key={step} className="text-lg font-semibold text-white">
        {question.q}
      </h3>

      <div className="flex flex-col gap-2.5">
        {question.options.map((opt, idx) => {
          const isCorrect = idx === question.answer
          const isChosen = idx === selected
          const showResult = selected !== null

          return (
            <button
              key={opt}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                showResult && isCorrect
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                  : showResult && isChosen
                    ? 'border-red-500/50 bg-red-500/10 text-red-300'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:border-brand-500/40 hover:bg-white/10'
              }`}
            >
              {opt}
              {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {showResult && isChosen && !isCorrect && <XCircle className="h-4 w-4 shrink-0" />}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <button
          onClick={handleNext}
          className="glow-gold self-end rounded-xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-surface-0 transition hover:brightness-110"
        >
          {isLast ? 'See Results' : 'Next Question'}
        </button>
      )}
    </div>
  )
}
