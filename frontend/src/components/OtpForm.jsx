import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { apiErrorMessage } from '../services/api'
import Button from './ui/Button'
import { Input } from './ui/Input'

const storageKey = (purpose) => `payan_otp_${purpose}`
function savedChallenge(purpose) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey(purpose)))
    return saved?.expiresAt > Date.now() ? saved : null
  } catch { return null }
}

export default function OtpForm({ purpose, referralCode = '', onSuccess }) {
  const { verifyOtp } = useAuth()
  const [saved] = useState(() => savedChallenge(purpose))
  const [channel, setChannel] = useState(saved?.channel || 'phone')
  const [identifier, setIdentifier] = useState(saved?.identifier || '')
  const [name, setName] = useState(saved?.name || '')
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState(saved)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [clock, setClock] = useState(() => Date.now())
  const [retryAt, setRetryAt] = useState(saved?.retryAt || 0)
  const codeInput = useRef(null)
  const remaining = Math.max(0, Math.ceil((retryAt - clock) / 1000))
  const expired = !!challenge && challenge.expiresAt <= clock

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    if (challenge) {
      sessionStorage.setItem(storageKey(purpose), JSON.stringify(challenge))
      codeInput.current?.focus()
    } else sessionStorage.removeItem(storageKey(purpose))
  }, [challenge, purpose])

  const showError = (failure) => {
    const message = apiErrorMessage(failure)
    setError(message)
    const retry = Number(failure.response?.headers?.['retry-after'])
    if (failure.response?.status === 429 && retry > 0) {
      setRetryAt(Date.now() + retry * 1000)
      setClock(Date.now())
    }
  }
  const send = async () => {
    const { data, message } = await authService.sendOtp({ channel, identifier, purpose,
      ...(purpose === 'register' ? { name, referral_code: referralCode || undefined } : {}) })
    const next = { id: data.challenge_id, channel, identifier, name,
      expiresAt: Date.now() + data.expires_in * 1000, retryAt: Date.now() + data.resend_after * 1000 }
    setChallenge(next)
    setCode('')
    setRetryAt(next.retryAt)
    setClock(Date.now())
    setNotice(message)
  }
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (challenge && !expired) {
        const user = await verifyOtp({ challenge_id: challenge.id, code })
        sessionStorage.removeItem(storageKey(purpose))
        onSuccess(user)
      } else await send()
    } catch (failure) { showError(failure) }
    finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex gap-2" role="group" aria-label="Verification method">
      {['phone', 'email'].map((method) => <button key={method} type="button" disabled={busy || !!challenge}
        aria-pressed={channel === method} onClick={() => { setChannel(method); setIdentifier(''); setError(''); setNotice('') }}
        className={`flex-1 rounded-lg border p-2 text-sm ${channel === method ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200'}`}>
        {method === 'phone' ? 'Mobile OTP' : 'Email OTP'}</button>)}
    </div>
    {purpose === 'register' && <Input label="Full name" required maxLength={255} value={name} disabled={busy || !!challenge} onChange={(e) => setName(e.target.value)} />}
    <Input label={channel === 'phone' ? 'Mobile number' : 'Email'} type={channel === 'phone' ? 'tel' : 'email'}
      autoComplete={channel === 'phone' ? 'tel' : 'email'} placeholder={channel === 'phone' ? '9876543210 or +919876543210' : 'you@example.com'}
      required value={identifier} disabled={busy || !!challenge} onChange={(e) => { setIdentifier(e.target.value); setError('') }} />
    {channel === 'phone' && !challenge && <p className="text-xs text-slate-500">Enter a 10-digit Indian mobile number, or include your country code. {purpose === 'login' ? 'New here? We will create your account only after OTP verification.' : 'We will send a verification SMS.'}</p>}
    {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {challenge && <div className="space-y-3 border-t border-slate-100 pt-4">
      <h2 className="font-semibold text-slate-900">Verify your {channel === 'phone' ? 'mobile number' : 'email'}</h2>
      <p className="text-sm text-slate-600">Enter the 6-digit OTP for {identifier}. {expired ? 'Your code has expired. Request a new OTP.' : `Valid for ${Math.max(1, Math.ceil((challenge.expiresAt - clock) / 60000))} minute(s).`}</p>
      {!expired && <Input ref={codeInput} label="6-digit OTP" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6}
        placeholder="Enter OTP" required value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError('') }} />}
      <p className="text-xs text-slate-500">SMS can take a minute. Check your Messages inbox and spam/blocked messages before resending.</p>
    </div>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Button type="submit" className="w-full" loading={busy} disabled={(!challenge || expired) && remaining > 0}>
      {challenge && !expired ? 'Verify OTP & log in' : remaining ? `Send OTP in ${remaining}s` : 'Send OTP'}
    </Button>
    {challenge && <div className="flex justify-between gap-3 text-sm">
      <button type="button" disabled={busy || remaining > 0} className="text-brand-600 disabled:text-slate-400" onClick={async () => {
        setBusy(true); setError('')
        try { await send() } catch (failure) { showError(failure) } finally { setBusy(false) }
      }}>{remaining ? `Resend OTP in ${remaining}s` : 'Resend OTP'}</button>
      <button type="button" disabled={busy} onClick={() => { setChallenge(null); setCode(''); setNotice(''); setError('') }} className="text-slate-600">Change number / email</button>
    </div>}
  </form>
}
