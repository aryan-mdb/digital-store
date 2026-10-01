/** Builds a wa.me click-to-chat link. `number` must be digits only, with country code. */
export function whatsappLink(number, message = '') {
  if (!number) return null
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${text}`
}
