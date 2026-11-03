import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'border border-brand-500 bg-brand-500 text-white font-semibold hover:-translate-y-0.5 hover:shadow-[var(--glow)] focus-visible:outline-brand-500',
  maroon: 'border border-brand-500 bg-brand-500 text-white font-semibold hover:-translate-y-0.5 hover:shadow-[var(--glow)] focus-visible:outline-brand-500',
  whatsapp: 'bg-[#25D366] text-white font-semibold hover:bg-[#1ebe5b] focus-visible:outline-[#25D366]',
  secondary: 'bg-transparent text-slate-700 border border-slate-200 hover:border-brand-500 hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
}

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2 text-sm',
  lg: 'px-7 py-3 text-base',
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
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 active:scale-[0.96]',
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
