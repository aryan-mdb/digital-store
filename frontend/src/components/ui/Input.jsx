import clsx from 'clsx'

export function Input({ label, error, className, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <input
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-colors',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-400' : 'border-slate-300',
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <textarea
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-colors',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-400' : 'border-slate-300',
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function Select({ label, error, className, children, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <select
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-colors',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-400' : 'border-slate-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
