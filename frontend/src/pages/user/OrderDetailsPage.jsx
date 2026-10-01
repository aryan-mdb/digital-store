import { Banknote, Download, MapPin, Phone } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import OrderTracking from '../../components/OrderTracking'
import { WhatsAppIcon } from '../../components/WhatsAppButton'
import Badge, { PAYMENT_METHOD_LABELS } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { apiErrorMessage } from '../../services/api'
import { downloadService, orderService } from '../../services/orderService'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { payWithRazorpay } from '../../utils/razorpay'
import { whatsappLink } from '../../utils/whatsapp'

const LIVE_REFRESH_MS = 30000

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const { whatsapp } = useSiteSettings()
  const [order, setOrder] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const [paying, setPaying] = useState(false)

  const load = useCallback(() => orderService.get(orderId).then((res) => setOrder(res.data)), [orderId])

  useEffect(() => {
    load()
  }, [load])

  // Refresh the live map while the parcel is on its way.
  const moving = ['shipped', 'out_for_delivery'].includes(order?.tracking?.status)
  useEffect(() => {
    if (!moving) return
    const id = setInterval(() => load().catch(() => {}), LIVE_REFRESH_MS)
    return () => clearInterval(id)
  }, [moving, load])

  if (!order) return <FullPageSpinner />

  const handleDownload = async (item) => {
    setDownloading(item.id)
    try {
      await downloadService.download(item.id, item.product_name)
      toast.success('Download started')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setDownloading(null)
    }
  }

  const handleRazorpay = async () => {
    setPaying(true)
    try {
      const result = await payWithRazorpay(order.id)
      if (result.status === 'paid') {
        toast.success('Payment successful!')
        setOrder(result.order)
      }
    } catch (err) {
      toast.error(err?.response ? apiErrorMessage(err) : err.message)
    } finally {
      setPaying(false)
    }
  }

  const pending = order.payment_status === 'pending'
  const helpLink = whatsapp?.enabled
    ? whatsappLink(whatsapp.number, `Hi! I need help with my order ${order.order_number}.`)
    : null

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order {order.order_number}</h1>
          <p className="text-sm text-slate-500">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="slate">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</Badge>
          <Badge status={order.payment_status} />
          {helpLink && (
            <a href={helpLink} target="_blank" rel="noreferrer">
              <Button size="sm" variant="whatsapp">
                <WhatsAppIcon className="h-4 w-4" /> Need help?
              </Button>
            </a>
          )}
        </div>
      </div>

      {pending && order.payment_method === 'crypto' && (
        <Card className="flex items-center justify-between p-4">
          <p className="text-sm text-slate-600">This order is awaiting crypto payment.</p>
          <Link to={`/dashboard/payments/${order.id}`}>
            <Button size="sm">Pay Now</Button>
          </Link>
        </Card>
      )}

      {pending && order.payment_method === 'razorpay' && (
        <Card className="flex items-center justify-between p-4">
          <p className="text-sm text-slate-600">Payment for this order is not complete yet.</p>
          <Button size="sm" loading={paying} onClick={handleRazorpay}>
            Pay {formatCurrency(order.total_amount, order.currency)}
          </Button>
        </Card>
      )}

      {pending && order.payment_method === 'cod' && (
        <Card className="flex items-center gap-3 p-4">
          <Banknote className="h-5 w-5 text-leaf-500" />
          <p className="text-sm text-slate-600">
            Cash on Delivery — please keep <strong>{formatCurrency(order.total_amount, order.currency)}</strong> ready when your
            order arrives.
          </p>
        </Card>
      )}

      <OrderTracking order={order} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                {item.thumbnail_url && (
                  <img src={item.thumbnail_url} alt="" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                )}
                <div>
                  <p className="font-medium text-slate-900">{item.product_name}</p>
                  <p className="text-sm text-slate-500">
                    Qty {item.quantity} &middot; {formatCurrency(item.price, order.currency)}
                  </p>
                </div>
              </div>
              {item.can_download ? (
                <Button size="sm" variant="secondary" loading={downloading === item.id} onClick={() => handleDownload(item)}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              ) : !item.is_physical ? (
                <span className="text-xs text-slate-400">Available after payment</span>
              ) : null}
            </div>
          ))}
          {order.wallet_amount_used > 0 && (
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-slate-500">Paid from wallet</span>
              <span className="text-slate-700">{formatCurrency(order.wallet_amount_used, order.currency)}</span>
            </div>
          )}
          <div className="flex items-center justify-between p-4">
            <span className="font-medium text-slate-900">Total</span>
            <span className="text-lg font-bold text-slate-900">{formatCurrency(order.total_amount, order.currency)}</span>
          </div>
        </Card>

        {order.shipping && (
          <Card className="p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-brand-600" /> Delivery address
            </p>
            <p className="font-medium text-slate-800">{order.shipping.name}</p>
            <p className="text-sm text-slate-600">{order.shipping.address}</p>
            <p className="text-sm text-slate-600">
              {order.shipping.city}, {order.shipping.state} – {order.shipping.pincode}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
              <Phone className="h-3.5 w-3.5" /> {order.shipping.phone}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
