import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 text-surface-0 font-semibold shadow-lg shadow-brand-900/30 hover:brightness-110 focus-visible:outline-brand-500',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
