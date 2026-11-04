import { BookOpen, Download, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { apiErrorMessage } from '../../services/api'
import { downloadService, orderService } from '../../services/orderService'
import { formatDate } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

export default function DownloadsPage() {
  const [items, setItems] = useState(null)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    orderService.list({ per_page: 100 }).then((res) => {
      const orders = unwrapPaginated(res).items.filter((o) => o.payment_status === 'paid')
      const readable = orders.flatMap((o) =>
        o.items
          .filter((item) => item.can_download)
          .map((item) => ({ ...item, order_number: o.order_number, purchased_at: o.created_at }))
      )
      setItems(readable)
    })
  }, [])

  if (!items) return <FullPageSpinner />

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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">My Guides</h1>

      {items.length === 0 ? (
        <EmptyState title="No guides yet" message="Purchased guides will appear here once payment is confirmed." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{item.product_name}</p>
                <p className="text-xs text-slate-500">
                  Order {item.order_number} &middot; {formatDate(item.purchased_at)}
                </p>
                {!item.downloadable && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-brand-500">
                    <Lock className="h-3 w-3" /> Premium · read online only
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link to={`/dashboard/read/${item.id}`} state={{ title: item.product_name }}>
                  <Button size="sm" variant="secondary">
                    <BookOpen className="h-4 w-4" /> Read online
                  </Button>
                </Link>
                {item.downloadable && (
                  <Button size="sm" loading={downloading === item.id} onClick={() => handleDownload(item)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
