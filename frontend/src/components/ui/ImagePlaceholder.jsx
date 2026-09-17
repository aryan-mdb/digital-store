import { ImageOff } from 'lucide-react'
import clsx from 'clsx'

/**
 * Animated stand-in shown whenever an image is missing or fails to
 * load, instead of the browser's broken-image icon.
 */
export default function ImagePlaceholder({ className, iconClassName }) {
  return (
    <div className={clsx('relative flex h-full w-full items-center justify-center overflow-hidden', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent" />
      <div className="absolute h-16 w-16 rounded-full bg-brand-500/20 blur-2xl animate-pulse" />
      <ImageOff className={clsx('relative h-8 w-8 animate-float-slow text-slate-600', iconClassName)} />
      <div className="animate-shimmer pointer-events-none absolute inset-0 opacity-60" />
    </div>
  )
}
