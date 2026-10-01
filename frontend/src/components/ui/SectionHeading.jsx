/** Label-style heading: small gold eyebrow, serif maroon title, ornamental flourish. */
export default function SectionHeading({ eyebrow, title, subtitle, className = '' }) {
  return (
    <div className={`mb-8 text-center ${className}`}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">{eyebrow}</p>}
      <h2 className="mt-1 text-3xl font-bold text-maroon-ink sm:text-4xl">{title}</h2>
      <Flourish className="mx-auto mt-3 h-4 w-48 text-brand-500" />
      {subtitle && <p className="mx-auto mt-3 max-w-xl text-slate-500">{subtitle}</p>}
    </div>
  )
}

export function Flourish({ className }) {
  return (
    <svg viewBox="0 0 200 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M2 8 H72" />
      <path d="M128 8 H198" />
      <path d="M72 8 C80 0 90 0 94 8 C90 16 80 16 72 8 Z" />
      <path d="M128 8 C120 0 110 0 106 8 C110 16 120 16 128 8 Z" />
      <path d="M100 2 L106 8 L100 14 L94 8 Z" fill="currentColor" />
      <circle cx="2" cy="8" r="1.6" fill="currentColor" />
      <circle cx="198" cy="8" r="1.6" fill="currentColor" />
    </svg>
  )
}
