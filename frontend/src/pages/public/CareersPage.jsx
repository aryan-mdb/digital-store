import { CheckCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import usePageMeta from '../../hooks/usePageMeta'
import { apiErrorMessage } from '../../services/api'
import { careerService } from '../../services/careerService'

const MAX_CV_MB = 8

const field =
  'w-full rounded-[10px] border border-slate-200 bg-slate-100 px-3.5 py-3 text-slate-900 placeholder-slate-400 outline-none transition'

function Label({ text, optional, children }) {
  return (
    <label className="grid gap-2 text-[0.92rem] font-medium text-slate-500">
      <span>
        {text} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </span>
      {children}
    </label>
  )
}

export default function CareersPage() {
  usePageMeta('Careers', 'Join The LERN Project — remote roles in content, marketing, AI automation and partnerships.')
  const formRef = useRef(null)
  const [openings, setOpenings] = useState(null)
  const [role, setRole] = useState('General application')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    careerService
      .openings()
      .then((res) => {
        setOpenings(res.data)
        if (res.data[0]) setRole(res.data[0].title)
      })
      .catch(() => setOpenings([]))
  }, [])

  const applyFor = (title) => {
    setRole(title)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const form = new FormData(e.currentTarget)
    const cv = form.get('cv')
    if (cv instanceof File && cv.size > MAX_CV_MB * 1024 * 1024) {
      setError(`Your CV is larger than ${MAX_CV_MB} MB. Please upload a smaller file.`)
      return
    }
    setSending(true)
    try {
      await careerService.apply(form)
      setDone(true)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1160px] px-5 pb-20">
      <section className="pb-10 pt-16 sm:pt-24">
        <p className="eyebrow">Careers</p>
        <h1 className="mb-3 text-[clamp(1.9rem,4vw,2.8rem)] font-bold text-slate-900">
          Build the future of learning <span className="text-neon">with us.</span>
        </h1>
        <p className="max-w-[60ch] text-[1.05rem] text-slate-500">
          Remote-first, small team, big ambitions. If you love teaching, marketing or automation, we’d like to hear from you.
        </p>
      </section>

      <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2">
        <div>
          <h2 className="mb-5 text-[1.6rem] font-bold text-slate-900">Open roles</h2>
          {!openings ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-[14px] bg-slate-100" />
              ))}
            </div>
          ) : openings.length === 0 ? (
            <p className="text-slate-500">No open roles right now — send a general application and we’ll keep it on file.</p>
          ) : (
            <div className="grid gap-3">
              {openings.map((r) => (
                <div key={r.id} className="neon-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-[1.05rem] font-bold text-slate-900">{r.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{r.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">{r.type}</p>
                  </div>
                  <button type="button" onClick={() => applyFor(r.title)} className="btn-ghost-neon shrink-0 px-4! py-2! text-sm!">
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={formRef} className="scroll-mt-24 rounded-[14px] border border-slate-200 bg-surface-1 p-6 sm:p-8">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-brand-500" />
              <h3 className="text-2xl font-bold text-slate-900">Application sent</h3>
              <p className="max-w-sm text-slate-500">Thanks for applying for {role}. We read every application and will get back to you if there’s a fit.</p>
              <button type="button" onClick={() => setDone(false)} className="btn-ghost-neon mt-2">
                Apply for another role
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-[18px]">
              <h3 className="text-xl font-bold text-slate-900">Apply now</h3>
              <div className="grid gap-[18px] sm:grid-cols-2">
                <Label text="Full name">
                  <input name="name" required autoComplete="name" className={field} />
                </Label>
                <Label text="Email">
                  <input name="email" type="email" required autoComplete="email" className={field} />
                </Label>
              </div>
              <div className="grid gap-[18px] sm:grid-cols-2">
                <Label text="Phone" optional>
                  <input name="phone" type="tel" autoComplete="tel" className={field} />
                </Label>
                <Label text="City" optional>
                  <input name="city" autoComplete="address-level2" className={field} />
                </Label>
              </div>
              <div className="grid gap-[18px] sm:grid-cols-2">
                <Label text="Role">
                  <select name="role" required value={role} onChange={(e) => setRole(e.target.value)} className={field}>
                    {(openings ?? []).map((r) => (
                      <option key={r.id}>{r.title}</option>
                    ))}
                    <option>General application</option>
                  </select>
                </Label>
                <Label text="Years of experience" optional>
                  <input name="experience" type="number" min="0" max="50" className={field} />
                </Label>
              </div>
              <Label text="LinkedIn profile">
                <input
                  name="linkedin"
                  type="url"
                  required
                  placeholder="https://www.linkedin.com/in/your-name"
                  pattern="https?://([a-z]{2,3}\.)?linkedin\.com/.+"
                  title="Paste your full LinkedIn profile link"
                  className={field}
                />
              </Label>
              <Label text="CV / Résumé">
                <input
                  name="cv"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  className={`${field} cursor-pointer py-2.5 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-[#26262c] file:bg-surface-1 file:px-3 file:py-1.5 file:text-white`}
                />
              </Label>
              <p className="-mt-2 text-[0.82rem] text-slate-500">PDF or Word, up to {MAX_CV_MB} MB.</p>
              <Label text="Why LERN?" optional>
                <textarea name="message" rows={4} placeholder="A few lines about you and what you’d bring." className={`${field} resize-y`} />
              </Label>
              {error && <p className="rounded-[10px] border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={sending} className="btn-neon disabled:opacity-60">
                {sending ? 'Sending…' : 'Submit application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
