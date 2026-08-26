import { useEffect, useState } from 'react'

/** Ticks down to `expiresAt` (ISO string) and reports remaining seconds. */
export function useCountdown(expiresAt) {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(expiresAt))

  useEffect(() => {
    setSecondsLeft(secondsUntil(expiresAt))
    const interval = setInterval(() => {
      setSecondsLeft(secondsUntil(expiresAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const minutes = Math.floor(Math.max(secondsLeft, 0) / 60)
  const seconds = Math.max(secondsLeft, 0) % 60
  const label = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return { secondsLeft, label, isExpired: secondsLeft <= 0 }
}

function secondsUntil(expiresAt) {
  if (!expiresAt) return 0
  return Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000)
}
