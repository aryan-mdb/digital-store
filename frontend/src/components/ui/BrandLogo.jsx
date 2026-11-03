import clsx from 'clsx'
import { SITE } from '../../config/site'

/** Neon square mark + wordmark. */
export default function BrandLogo({ className }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5 font-display text-lg font-bold text-[var(--ink)]', className)}>
      <span className="logo-mark">{SITE.mark}</span>
      {SITE.name}
    </span>
  )
}
