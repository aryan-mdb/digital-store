import { ArrowLeft, Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'

// Each question lists its correct answer first in `a`; options are shuffled at play time.
const SUBJECTS = [
  {
    key: 'lern',
    title: 'About LERN',
    blurb: 'The method, payments and your dashboard.',
    questions: [
      { q: 'What do the four letters of LERN stand for?', a: 'Learn, Earn, Return, Nurture', wrong: ['Look, Explore, Read, Note', 'Lead, Engage, Reach, Network', 'Listen, Edit, Run, Next'] },
      { q: 'Where do you read a guide after buying it?', a: 'In your dashboard', wrong: ['Only by email', 'On a printed copy', 'In a mobile app only'] },
      { q: 'Which of these is NOT a way to pay at LERN?', a: 'Cheque by post', wrong: ['UPI via Razorpay', 'Crypto (USDT)', 'Debit / credit card'] },
      { q: 'Which LERN step is about habits and systems?', a: 'Nurture', wrong: ['Learn', 'Earn', 'Return'] },
      { q: 'How do you earn referral rewards?', a: 'By inviting friends who make a purchase', wrong: ['By spinning the wheel', 'By logging in daily', 'By leaving a review'] },
      { q: 'What can your wallet balance be used for?', a: 'Paying for part or all of a purchase', wrong: ['Nothing, it is just for show', 'Only withdrawing to a bank', 'Only buying spins'] },
    ],
  },
  {
    key: 'ai',
    title: 'AI Automation',
    blurb: 'Agents, workflows and no-code tools.',
    questions: [
      { q: 'Which task is the best first candidate for automation?', a: 'One you repeat often with the same steps', wrong: ['One you do once a year', 'One that needs a new decision every time', 'One nobody has written down'] },
      { q: 'In a no-code workflow, what starts the automation?', a: 'A trigger, like a new form entry', wrong: ['A server restart', 'A manual code deploy', 'A browser refresh'] },
      { q: 'What is a "prompt" when working with an AI model?', a: 'The instructions and context you give it', wrong: ['The model’s training data', 'A paid subscription plan', 'The model’s error log'] },
      { q: 'Why keep a human in the loop for AI replies to customers?', a: 'To catch mistakes before they reach people', wrong: ['To slow the system down on purpose', 'Because AI cannot send emails', 'To avoid using any templates'] },
      { q: 'What does an AI "agent" add over a single prompt?', a: 'It can take steps and use tools toward a goal', wrong: ['It removes the need for any data', 'It only works offline', 'It replies more slowly'] },
      { q: 'A good way to measure an automation’s value is…', a: 'Hours saved per week', wrong: ['Number of apps installed', 'Lines of code written', 'How complex the workflow looks'] },
    ],
  },
  {
    key: 'marketing',
    title: 'Digital Marketing',
    blurb: 'SEO, content, email and social.',
    questions: [
      { q: 'What does SEO stand for?', a: 'Search Engine Optimisation', wrong: ['Social Engagement Output', 'Sales Email Operation', 'Search Entry Order'] },
      { q: 'Which channel do you fully own?', a: 'Your email list', wrong: ['A social media following', 'A paid ad account', 'A marketplace listing'] },
      { q: 'What is a "lead magnet"?', a: 'A free resource offered in exchange for contact details', wrong: ['A paid ad format', 'A type of backlink', 'A website hosting plan'] },
      { q: 'Why publish content consistently?', a: 'It builds trust and search visibility over time', wrong: ['Search engines charge less', 'It removes the need for a website', 'Old posts get deleted automatically'] },
      { q: 'What is a call to action (CTA)?', a: 'A prompt telling the reader what to do next', wrong: ['A legal disclaimer', 'A website footer', 'An analytics report'] },
      { q: 'What does an email open rate measure?', a: 'The share of recipients who opened the email', wrong: ['How many people unsubscribed', 'How fast the email was sent', 'The number of links in the email'] },
    ],
  },
  {
    key: 'performance',
    title: 'Performance Marketing',
    blurb: 'Paid ads, tracking and ROAS.',
    questions: [
      { q: 'What does ROAS stand for?', a: 'Return on Ad Spend', wrong: ['Rate of Ad Success', 'Reach of All Sales', 'Revenue Over Average Sales'] },
      { q: 'If you spend ₹1,000 and earn ₹4,000 in sales, your ROAS is…', a: '4x', wrong: ['0.25x', '3x', '40x'] },
      { q: 'What is the purpose of an A/B test?', a: 'Compare two versions to see which performs better', wrong: ['Run ads in two countries', 'Double the daily budget', 'Hide ads from competitors'] },
      { q: 'What does CTR measure?', a: 'Clicks divided by impressions', wrong: ['Cost per sale', 'Total ad spend', 'Time spent on the page'] },
      { q: 'Why install a tracking pixel?', a: 'To measure conversions that come from ads', wrong: ['To make the page load faster', 'To block competitor ads', 'To lower the ad price'] },
      { q: 'When should you scale an ad campaign?', a: 'When it is profitable and results are stable', wrong: ['On the first day it runs', 'When CTR is falling', 'Whenever the budget is unspent'] },
    ],
  },
  {
    key: 'sales',
    title: 'Sales',
    blurb: 'Prospecting, calls and closing.',
    questions: [
      { q: 'What is the main goal of a discovery call?', a: 'Understand the buyer’s problem and goals', wrong: ['Close the deal immediately', 'Read out the price list', 'Talk about your company history'] },
      { q: 'What is "prospecting"?', a: 'Finding and reaching potential customers', wrong: ['Sending invoices', 'Handling refunds', 'Designing the product'] },
      { q: 'A good way to handle an objection is to…', a: 'Ask a question to understand it first', wrong: ['Ignore it and keep pitching', 'Drop the price straight away', 'End the call'] },
      { q: 'Why does follow-up matter?', a: 'Many deals close after several touchpoints', wrong: ['It annoys buyers into paying', 'It is legally required', 'It replaces the first call'] },
      { q: 'What should a pitch focus on?', a: 'The outcome the customer gets', wrong: ['Every product feature', 'Your competitors’ flaws', 'Your own sales targets'] },
      { q: 'What is a sales pipeline?', a: 'The stages deals move through to close', wrong: ['A list of past refunds', 'The office internet line', 'A product delivery route'] },
    ],
  },
  {
    key: 'earn',
    title: 'Affiliate & Drop Shipping',
    blurb: 'Commissions, products and suppliers.',
    questions: [
      { q: 'How does an affiliate marketer earn?', a: 'A commission on sales made through their link', wrong: ['A fixed salary from the brand', 'Selling their own stock', 'Charging buyers a fee'] },
      { q: 'In drop shipping, who holds the inventory?', a: 'The supplier', wrong: ['The store owner’s warehouse', 'The customer', 'The payment provider'] },
      { q: 'Before launching a drop-shipping product you should…', a: 'Validate demand and test the supplier', wrong: ['Order 1,000 units first', 'Skip checking reviews', 'Set the lowest possible price'] },
      { q: 'What makes an affiliate recommendation trustworthy?', a: 'Honest reviews of products you understand', wrong: ['Promoting every offer you find', 'Hiding that it is an affiliate link', 'Only quoting the price'] },
      { q: 'What is a "niche"?', a: 'A focused audience or topic you serve', wrong: ['A type of payment method', 'A shipping company', 'An ad size'] },
      { q: 'Your profit per sale is roughly…', a: 'Selling price minus all costs', wrong: ['The selling price', 'The ad spend', 'The supplier’s price'] },
    ],
  },
  {
    key: 'mindset',
    title: 'Mindset & Growth',
    blurb: 'Habits, focus and manifestation.',
    questions: [
      { q: 'What is "habit stacking"?', a: 'Attaching a new habit to an existing one', wrong: ['Doing many habits at once', 'Quitting habits one by one', 'Tracking habits in a spreadsheet'] },
      { q: 'Which helps focus the most?', a: 'Working on one task in a set time block', wrong: ['Checking messages every few minutes', 'Keeping many tabs open', 'Switching tasks often'] },
      { q: 'Why write down your goals?', a: 'It makes them clearer and easier to act on', wrong: ['It guarantees success', 'It replaces planning', 'It is only for school'] },
      { q: 'In manifestation practice, visualisation works best when…', a: 'Paired with daily action', wrong: ['Used instead of action', 'Done once a year', 'Kept vague'] },
      { q: 'What is a growth mindset?', a: 'Believing skills improve with effort', wrong: ['Believing talent is fixed', 'Avoiding challenges', 'Never asking for feedback'] },
      { q: 'A good way to keep a streak going is to…', a: 'Make the habit small enough to do on bad days', wrong: ['Only do it when motivated', 'Make it as hard as possible', 'Skip weekends and restart'] },
    ],
  },
]

const ROUND_SIZE = 5

function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// A fresh round: random questions from the subject, each with shuffled options.
function buildRound(subject) {
  return shuffle(subject.questions)
    .slice(0, ROUND_SIZE)
    .map((item) => ({ q: item.q, answer: item.a, options: shuffle([item.a, ...item.wrong]) }))
}

export default function QuizGame() {
  const [subject, setSubject] = useState(null)
  const [round, setRound] = useState([])
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [finished, setFinished] = useState(false)

  const start = (next) => {
    setSubject(next)
    setRound(buildRound(next))
    setStep(0)
    setScore(0)
    setSelected(null)
    setFinished(false)
  }

  if (!subject) {
    return (
      <div className="flex flex-col gap-5">
        <div className="text-center">
          <p className="eyebrow mb-1!">Quiz challenge</p>
          <h3 className="text-2xl font-bold text-slate-900">Pick a subject</h3>
          <p className="mt-1 text-sm text-slate-500">{ROUND_SIZE} quick questions — a new mix every round.</p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SUBJECTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => start(s)}
              className="rounded-[14px] border border-slate-200 bg-slate-100 px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-brand-500/60 hover:shadow-[0_10px_30px_-15px_rgba(255,46,77,0.6)]"
            >
              <span className="block font-display font-bold text-slate-900">{s.title}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{s.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const question = round[step]
  const isLast = step === round.length - 1

  if (finished) {
    const pct = Math.round((score / round.length) * 100)
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-500/50 bg-brand-500/10 shadow-[var(--glow)]">
          <Award className="h-10 w-10 text-brand-500" />
        </div>
        <p className="eyebrow mb-0!">{subject.title}</p>
        <h3 className="text-2xl font-bold text-slate-900">
          {score} / {round.length} correct
        </h3>
        <p className="text-slate-500">
          {pct >= 80
            ? `You know ${subject.title} inside out! 🏆`
            : pct >= 50
              ? 'Solid effort — one more round and you’ll ace it. 🎯'
              : 'Good start — try again with a fresh set of questions. 🔁'}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => start(subject)} className="btn-neon">
            <RotateCcw className="h-4 w-4" /> New questions
          </button>
          <button type="button" onClick={() => setSubject(null)} className="btn-ghost-neon">
            Change subject
          </button>
        </div>
      </div>
    )
  }

  const handleSelect = (opt) => {
    if (selected !== null) return
    setSelected(opt)
    if (opt === question.answer) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (isLast) {
      setFinished(true)
      return
    }
    setStep((s) => s + 1)
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
        <button type="button" onClick={() => setSubject(null)} className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5" /> {subject.title}
        </button>
        <span>
          Question {step + 1} / {round.length} · Score {score}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500 shadow-[var(--glow)] transition-all duration-300"
          style={{ width: `${((step + (selected !== null ? 1 : 0)) / round.length) * 100}%` }}
        />
      </div>

      <h3 key={`${subject.key}-${step}`} className="animate-pop-in text-lg font-semibold text-slate-900">
        {question.q}
      </h3>

      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => {
          const isCorrect = opt === question.answer
          const isChosen = opt === selected
          const showResult = selected !== null

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              disabled={showResult}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
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
        <button type="button" onClick={handleNext} className="btn-neon self-end px-6! py-2.5! text-sm!">
          {isLast ? 'See results' : 'Next question'}
        </button>
      )}
    </div>
  )
}
