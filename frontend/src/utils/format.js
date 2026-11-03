export function formatCurrency(amount, currency = 'USD') {
  const value = Number(amount ?? 0)
  try {
    // Whole prices read cleaner without ".00" (₹1,499 rather than ₹1,499.00).
    const fraction = Number.isInteger(value) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}
    const locale = currency === 'INR' ? 'en-IN' : 'en-US'
    return new Intl.NumberFormat(locale, { style: 'currency', currency, ...fraction }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
