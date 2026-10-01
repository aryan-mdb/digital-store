import clsx from 'clsx'

/** PAYAN wordmark as printed on the jar: serif maroon name over a green "Pure Cow Ghee" line. */
export default function BrandLogo({ onDark = false, className }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <span className="bg-gold-foil flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-[2px] shadow-sm">
        <span className="flex h-full w-full items-center justify-center rounded-full bg-[#fbf3dc] font-display text-lg font-extrabold text-[#7a2318]">
          P
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={clsx('font-display text-2xl font-extrabold tracking-[0.08em]', onDark ? 'text-[#fdf3dc]' : 'text-maroon-ink')}>
          PAYAN
        </span>
        <span className={clsx('mt-0.5 text-[10px] font-bold uppercase tracking-[0.28em]', onDark ? 'text-brand-300' : 'text-leaf-500')}>
          Pure Cow Ghee
        </span>
      </span>
    </span>
  )
}
