import clsx from 'clsx'
import { Check, ExternalLink, MapPin, PackageCheck, PackageOpen, ShoppingBag, Truck, XCircle, BadgeCheck, Bike } from 'lucide-react'
import Card from './ui/Card'
import { formatDateTime } from '../utils/format'

export const TRACKING_STAGES = [
  { key: 'placed', label: 'Order Placed', icon: ShoppingBag },
  { key: 'confirmed', label: 'Confirmed', icon: BadgeCheck },
  { key: 'packed', label: 'Packed', icon: PackageOpen },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
]

export const TRACKING_LABELS = {
  ...Object.fromEntries(TRACKING_STAGES.map((s) => [s.key, s.label])),
  cancelled: 'Cancelled',
}

/**
 * Customer-facing delivery tracker: stage stepper, live map (when the
 * admin/delivery person has shared a position) and the event timeline.
 */
export default function OrderTracking({ order }) {
  const tracking = order?.tracking
  if (!tracking) return null

  const cancelled = tracking.status === 'cancelled'
  const currentIdx = TRACKING_STAGES.findIndex((s) => s.key === tracking.status)
  const events = [...(tracking.events || [])].reverse()

  return (
    <Card className="overflow-hidden">
      <div className="bg-forest-velvet flex items-center justify-between px-5 py-4 text-[#fdf3dc]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Delivery status</p>
          <p className="font-display text-xl font-bold">
            {tracking.status ? TRACKING_LABELS[tracking.status] : 'Awaiting payment'}
          </p>
        </div>
        <Truck className="h-8 w-8 text-brand-300" />
      </div>

      {cancelled ? (
        <div className="flex items-center gap-3 p-5 text-red-700">
          <XCircle className="h-6 w-6" />
          <p className="text-sm font-medium">This order was cancelled.</p>
        </div>
      ) : (
        <div className="overflow-x-auto px-5 pb-2 pt-6">
          <ol className="flex min-w-[560px] items-start">
            {TRACKING_STAGES.map((stage, i) => {
              const done = i <= currentIdx
              const isCurrent = i === currentIdx
              return (
                <li key={stage.key} className="relative flex flex-1 flex-col items-center text-center">
                  {i > 0 && (
                    <span
                      className={clsx(
                        'absolute right-1/2 top-5 h-1 w-full -translate-y-1/2 rounded-full',
                        i <= currentIdx ? 'bg-brand-500' : 'bg-slate-200'
                      )}
                    />
                  )}
                  <span
                    className={clsx(
                      'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition',
                      done ? 'border-brand-500 bg-gold-foil text-forest-900' : 'border-slate-300 bg-white text-slate-400'
                    )}
                  >
                    {isCurrent && <span className="animate-ping-soft absolute inset-0 rounded-full bg-brand-400/50" />}
                    {done && !isCurrent ? <Check className="relative h-5 w-5" /> : <stage.icon className="relative h-5 w-5" />}
                  </span>
                  <span className={clsx('mt-2 text-xs font-semibold', done ? 'text-slate-900' : 'text-slate-400')}>
                    {stage.label}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <LiveMap tracking={tracking} />

      {events.length > 0 && (
        <div className="border-t border-slate-100 p-5">
          <p className="mb-3 text-sm font-semibold text-slate-900">Tracking history</p>
          <ol className="relative space-y-4 border-l-2 border-slate-200 pl-5">
            {events.map((e, i) => (
              <li key={e.id} className="relative">
                <span
                  className={clsx(
                    'absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-[var(--color-surface-1)]',
                    i === 0 ? 'bg-brand-500' : 'bg-slate-300'
                  )}
                />
                <p className="text-sm font-semibold text-slate-900">{TRACKING_LABELS[e.status] || e.status}</p>
                {e.location && (
                  <p className="flex items-center gap-1 text-sm text-slate-600">
                    <MapPin className="h-3.5 w-3.5" /> {e.location}
                  </p>
                )}
                {e.note && <p className="text-sm text-slate-500">{e.note}</p>}
                <p className="text-xs text-slate-400">{formatDateTime(e.created_at)}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  )
}

/** OpenStreetMap embed (no API key needed) for a GPS fix, or a Google Maps text search otherwise. */
function LiveMap({ tracking }) {
  const { lat, lng, current_location: place, status } = tracking
  if (status === 'delivered' || status === 'cancelled') return null
  if (lat == null && !place) return null

  const hasGps = lat != null && lng != null
  const d = 0.012
  const src = hasGps
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=12&output=embed`
  const openUrl = hasGps
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(place)}`

  return (
    <div className="border-t border-slate-100 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping-soft absolute inset-0 rounded-full bg-emerald-500" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          Current location{place ? `: ${place}` : ''}
        </p>
        <a href={openUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
          Open in Maps <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <iframe
        title="Order location"
        src={src}
        loading="lazy"
        className="h-64 w-full rounded-lg border border-slate-200"
      />
    </div>
  )
}
