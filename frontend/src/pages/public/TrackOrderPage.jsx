import { PackageSearch, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import OrderTracking from '../../components/OrderTracking'
import Badge, { PAYMENT_METHOD_LABELS } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import usePageMeta from '../../hooks/usePageMeta'
import { apiErrorMessage } from '../../services/api'
import { siteService } from '../../services/siteService'
import { formatCurrency, formatDateTime } from '../../utils/format'

const LIVE_REFRESH_MS = 30000

export default function TrackOrderPage() {
  usePageMeta('Track Your Order', 'Track your order live — see every delivery step and the current location on the map.')
  const [params] = useSearchParams()
  const [form, setForm] = useState({ order_number: params.get('order') || '', phone: '' })
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const lookup = () => siteService.trackOrder(form.order_number, form.phone).then((res) => setOrder(res.data))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await lookup()
    } catch (error) {
      setOrder(null)
      toast.error(apiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  // Keep the map pin fresh while the parcel is on the move.
  const moving = ['shipped', 'out_for_delivery'].includes(order?.tracking?.status)
  useEffect(() => {
    if (!moving) return
    const id = setInterval(() => lookup().catch(() => {}), LIVE_REFRESH_MS)
    return () => clearInterval(id)
  }, [moving, order?.id])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <div className="bg-gold-foil mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
          <PackageSearch className="h-8 w-8 text-forest-800" />
        </div>
        <h1 className="text-3xl font-bold text-forest-ink sm:text-4xl">Track your order</h1>
        <p className="mt-2 text-slate-500">Enter your order number and the mobile number used at checkout.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Input
            label="Order number"
            required
            placeholder="ORD-261001-XXXXXX"
            value={form.order_number}
            onChange={(e) => setForm({ ...form, order_number: e.target.value })}
          />
          <Input
            label="Mobile number"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Button type="submit" loading={loading} className="h-[38px]">
            <Search className="h-4 w-4" /> Track
          </Button>
        </form>
      </Card>

      {order && (
        <div className="mt-6 space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-display text-lg font-bold text-slate-900">{order.order_number}</p>
              <p className="text-sm text-slate-500">
                {order.items?.[0]?.product_name} · Placed {formatDateTime(order.created_at)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="slate">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</Badge>
              <Badge status={order.payment_status} />
              <span className="font-semibold text-slate-900">{formatCurrency(order.total_amount, order.currency)}</span>
            </div>
          </Card>
          <OrderTracking order={order} />
        </div>
      )}
    </div>
  )
}
