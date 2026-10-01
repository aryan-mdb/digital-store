import { useSiteSettings } from '../context/SiteSettingsContext'
import { whatsappLink } from '../utils/whatsapp'

export function WhatsAppIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75A12.93 12.93 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.8c-2.02 0-4-.54-5.72-1.57l-.41-.24-3.96 1.04 1.06-3.86-.27-.4A10.73 10.73 0 0 1 5.24 16c0-5.95 4.85-10.8 10.8-10.8 5.94 0 10.76 4.85 10.76 10.8 0 5.95-4.82 10.8-10.76 10.8Zm5.92-8.08c-.32-.16-1.92-.95-2.22-1.06-.3-.11-.51-.16-.73.16-.21.32-.84 1.06-1.03 1.27-.19.22-.38.24-.7.08-.33-.16-1.37-.5-2.6-1.6-.96-.86-1.61-1.92-1.8-2.24-.19-.32-.02-.5.14-.66.15-.14.33-.38.49-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.69 0 1.58 1.16 3.12 1.32 3.33.16.22 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.48.21 2.03.13.62-.09 1.92-.78 2.19-1.54.27-.76.27-1.4.19-1.54-.08-.13-.29-.21-.62-.37Z" />
    </svg>
  )
}

/** Floating click-to-chat button, shown when the admin has WhatsApp enabled. */
export default function WhatsAppButton() {
  const { whatsapp } = useSiteSettings()
  if (!whatsapp?.enabled) return null

  return (
    <a
      href={whatsappLink(whatsapp.number, whatsapp.message)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2"
    >
      <span className="pointer-events-none hidden rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 opacity-0 shadow-lg ring-1 ring-black/5 transition group-hover:opacity-100 sm:block">
        Chat with us
      </span>
      <span className="animate-wa-bounce relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/25 transition group-hover:scale-105">
        <span className="animate-ping-soft absolute inset-0 rounded-full bg-[#25D366]" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </span>
    </a>
  )
}
