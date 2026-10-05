import clsx from 'clsx'

/** PAYAN round label logo + wordmark (green name, "Pure · Natural · Traditional" strapline). */
export default function BrandLogo({ onDark = false, className }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <img
        src="/logo-192.png"
        alt=""
        width="48"
        height="48"
        className="h-12 w-12 shrink-0 rounded-full shadow-md ring-2 ring-brand-400/60"
      />
      <span className="flex flex-col leading-none">
        <span className={clsx('font-display text-2xl font-extrabold tracking-[0.06em]', onDark ? 'text-[#fff6d6]' : 'text-forest-ink')}>
          PAYAN
        </span>
        <span className={clsx('mt-1 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.14em]', onDark ? 'text-ghee-300' : 'text-brand-700')}>
          Pure · Natural · Traditional
        </span>
      </span>
    </span>
  )
}
