import { Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'

const QUESTIONS = [
  {
    q: 'What is the traditional "bilona" method of making ghee?',
    options: [
      'Boiling milk directly',
      'Churning curd by hand to get makhan, then slow-cooking it',
      'Mixing oil with butter',
      'Using a machine to separate cream',
    ],
    answer: 1,
  },
  {
    q: 'PAYAN ghee is made from the milk of which cows?',
    options: ['Desi cows', 'Buffaloes', 'Goats', 'Camels'],
    answer: 0,
  },
  {
    q: 'Which of these is NOT a way to pay at PAYAN?',
    options: ['UPI via Razorpay', 'Cash on Delivery', 'Debit / credit card', 'Cheque by post'],
    answer: 3,
  },
  {
    q: 'What does a good desi ghee look like when it sets?',
    options: ['Thin and watery', 'Grainy (danedar) and golden', 'Bright white', 'Green'],
    answer: 1,
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
          <Award className="h-10 w-10 text-brand-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
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
          className="glow-gold mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3 font-bold text-white transition hover:brightness-110"
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

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300"
          style={{ width: `${((step + (selected !== null ? 1 : 0)) / order.length) * 100}%` }}
        />
      </div>

      <h3 key={step} className="text-lg font-semibold text-slate-900">
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
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-brand-500/40 hover:bg-slate-200'
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
          className="glow-gold self-end rounded-xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
        >
          {isLast ? 'See Results' : 'Next Question'}
        </button>
      )}
    </div>
  )
}
