import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { apiErrorMessage } from '../../services/api'
import { downloadService, orderService } from '../../services/orderService'
import { formatCurrency, formatDateTime } from '../../utils/format'

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    orderService.get(orderId).then((res) => setOrder(res.data))
  }, [orderId])

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

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order {order.order_number}</h1>
          <p className="text-sm text-slate-500">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <Badge status={order.status} />
          <Badge status={order.payment_status} />
        </div>
      </div>

      {order.payment_status === 'pending' && (
        <Card className="flex items-center justify-between p-4">
          <p className="text-sm text-slate-600">This order is awaiting crypto payment.</p>
          <Link to={`/dashboard/payments/${order.id}`}>
            <Button size="sm">Pay Now</Button>
          </Link>
        </Card>
      )}

      <Card className="divide-y divide-slate-100">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-slate-900">{item.product_name}</p>
              <p className="text-sm text-slate-500">
                Qty {item.quantity} &middot; {formatCurrency(item.price, order.currency)}
              </p>
            </div>
            {item.can_download ? (
              <Button size="sm" variant="secondary" loading={downloading === item.id} onClick={() => handleDownload(item)}>
                <Download className="h-4 w-4" /> Download
              </Button>
            ) : (
              <span className="text-xs text-slate-400">Available after payment</span>
            )}
          </div>
        ))}
      </Card>

      <Card className="flex items-center justify-between p-4">
        <span className="font-medium text-slate-900">Total</span>
        <span className="text-lg font-bold text-slate-900">{formatCurrency(order.total_amount, order.currency)}</span>
      </Card>
    </div>
  )
}
