import { AlertTriangle, CheckCircle2, Clock, Copy } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { useCountdown } from '../../hooks/useCountdown'
import { apiErrorMessage } from '../../services/api'
import { orderService, paymentService } from '../../services/orderService'
import { formatCurrency } from '../../utils/format'

const POLL_INTERVAL_MS = 5000

export default function CryptoPaymentPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const pollRef = useRef(null)

  const { label: timeLeft, isExpired } = useCountdown(payment?.expires_at)

  const bootstrap = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: orderData } = await orderService.get(orderId)
      setOrder(orderData)

      if (orderData.payment_status === 'paid') {
        setPayment(orderData.crypto_payment)
        return
      }

      const { data: paymentData } = await paymentService.create(orderId)
      setPayment(paymentData)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  // Poll the backend (never trust a status the frontend computes itself).
  useEffect(() => {
    if (!payment || payment.status !== 'pending') return

    pollRef.current = setInterval(async () => {
      try {
        const { data } = await paymentService.get(payment.id)
        setPayment(data)
        if (data.status === 'paid') {
          toast.success('Payment confirmed!')
          clearInterval(pollRef.current)
        }
      } catch {
        // transient poll failure — try again on the next tick
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(pollRef.current)
  }, [payment?.id, payment?.status])

  const copyAddress = () => {
    if (!payment?.wallet_address) return
    navigator.clipboard.writeText(payment.wallet_address)
    toast.success('Address copied to clipboard')
  }

  if (loading) return <FullPageSpinner />

  if (error) {
    return (
      <Card className="mx-auto mt-10 max-w-md p-6 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <p className="text-slate-700">{error}</p>
        <Link to="/dashboard/orders" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
          Back to Orders
        </Link>
      </Card>
    )
  }

  const isPaid = payment?.status === 'paid' || order?.payment_status === 'paid'
  const isFailed = payment?.status === 'failed'
  const isTimedOut = isExpired && payment?.status === 'pending'

  return (
    <div className="mx-auto max-w-md">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-900 px-6 py-5 text-center text-white">
          <h1 className="text-lg font-bold">Crypto Payment</h1>
          <p className="text-sm text-slate-300">Order {order?.order_number}</p>
        </div>

        <div className="space-y-5 p-6">
          <Row label="Product" value={order?.items?.[0]?.product_name} />
          <Row label="Price" value={formatCurrency(order?.total_amount, order?.currency)} />

          {isPaid ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              <p className="text-lg font-semibold text-slate-900">Payment Successful</p>
              <p className="text-sm text-slate-500">Your order has been completed. You can now download your product.</p>
              <Button onClick={() => navigate(`/dashboard/orders/${order.id}`)}>Go to Order</Button>
            </div>
          ) : isFailed ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <AlertTriangle className="h-14 w-14 text-red-500" />
              <p className="text-lg font-semibold text-slate-900">Payment Failed</p>
              <p className="text-sm text-slate-500">Something went wrong with this payment. You can try again.</p>
              <Button onClick={bootstrap}>Try Again</Button>
            </div>
          ) : isTimedOut ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Clock className="h-14 w-14 text-amber-500" />
              <p className="text-lg font-semibold text-slate-900">Payment Expired</p>
              <p className="text-sm text-slate-500">This invoice has expired. Generate a new one to continue.</p>
              <Button onClick={bootstrap}>Generate New Invoice</Button>
            </div>
          ) : (
            <>
              <Row label="Pay With" value={payment?.cryptocurrency || 'Loading...'} />
              <Row
                label="Amount"
                value={payment?.crypto_amount ? `${payment.crypto_amount} ${payment.cryptocurrency}` : '—'}
              />

              {payment?.wallet_address && (
                <>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-500">Wallet Address</p>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <code className="flex-1 truncate text-xs text-slate-700">{payment.wallet_address}</code>
                      <button onClick={copyAddress} className="text-slate-400 hover:text-slate-600">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center rounded-lg border border-slate-200 bg-white p-4">
                    <QRCodeSVG value={payment.wallet_address} size={180} />
                  </div>
                </>
              )}

              {payment?.payment_url && (
                <a
                  href={payment.payment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-sm font-medium text-brand-600 hover:underline"
                >
                  Open hosted payment page &rarr;
                </a>
              )}

              <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                <span className="flex items-center gap-2 text-sm text-amber-700">
                  <Clock className="h-4 w-4" /> Expires in
                </span>
                <span className="font-mono text-sm font-semibold text-amber-700">{timeLeft}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <Badge status={payment?.status || 'pending'}>Waiting for payment...</Badge>
              </div>

              {payment?.transaction_id && (
                <Row label="Transaction ID" value={payment.transaction_id} mono />
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={mono ? 'max-w-[60%] truncate font-mono text-xs text-slate-700' : 'font-medium text-slate-900'}>
        {value}
      </span>
    </div>
  )
}
