/** Neon eyebrow, display title and muted lead — left aligned unless `center` is set. */
export default function SectionHeading({ eyebrow, title, subtitle, center = false, className = '' }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''} ${className}`} data-reveal="up">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="text-[clamp(1.9rem,4vw,2.8rem)] font-bold text-slate-900">{title}</h2>
      {subtitle && <p className={`mt-3 max-w-[60ch] text-[1.05rem] text-slate-500 ${center ? 'mx-auto' : ''}`}>{subtitle}</p>}
    </div>
  )
}
