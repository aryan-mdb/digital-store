import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { siteService } from '../services/siteService'

const SiteSettingsContext = createContext(null)

const FALLBACK = {
  payment_methods: { razorpay: false, cod: false, crypto: true },
  razorpay_key_id: null,
  whatsapp: { enabled: false, number: '', message: '' },
}

/**
 * Public storefront config (enabled payment methods, WhatsApp contact),
 * loaded once on boot. Admin pages call refresh() after saving.
 */
export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(
    () =>
      siteService
        .settings()
        .then((res) => setSettings({ ...FALLBACK, ...res.data }))
        .catch(() => {})
        .finally(() => setLoaded(true)),
    []
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <SiteSettingsContext.Provider value={{ ...settings, loaded, refresh }}>{children}</SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  return ctx
}
