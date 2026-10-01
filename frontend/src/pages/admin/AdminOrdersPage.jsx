import { Banknote, Crosshair, MapPin, Phone, Radio, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import OrderTracking, { TRACKING_LABELS, TRACKING_STAGES } from '../../components/OrderTracking'
import Badge, { PAYMENT_METHOD_LABELS } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { Input, Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import Table from '../../components/ui/Table'
import { adminService } from '../../services/adminService'
import { apiErrorMessage } from '../../services/api'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

const LIVE_PING_MS = 60000

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [trackingFilter, setTrackingFilter] = useState('')
  const [viewing, setViewing] = useState(null)

  const load = () =>
    adminService.orders
      .list({
        page,
        per_page: 15,
        search: search || undefined,
        status: statusFilter || undefined,
        payment_status: paymentFilter || undefined,
        payment_method: methodFilter || undefined,
        tracking_status: trackingFilter || undefined,
      })
      .then((res) => {
        const { items, meta } = unwrapPaginated(res)
        setOrders(items)
        setMeta(meta)
      })

  useEffect(() => {
    load()
  }, [page, statusFilter, paymentFilter, methodFilter, trackingFilter])

  const openOrder = (order) => {
    setViewing(order)
    adminService.orders.get(order.id).then((res) => setViewing(res.data))
  }

  const onOrderChanged = (updated) => {
    setViewing(updated)
    setOrders((list) => list.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)))
  }

  if (!orders) return <FullPageSpinner />

  const resetPage = (setter) => (e) => {
    setPage(1)
    setter(e.target.value)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Orders</h1>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            load()
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or phone..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </form>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Select value={statusFilter} onChange={resetPage(setStatusFilter)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </Select>
          <Select value={paymentFilter} onChange={resetPage(setPaymentFilter)}>
            <option value="">All payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
          </Select>
          <Select value={methodFilter} onChange={resetPage(setMethodFilter)}>
            <option value="">All methods</option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <Select value={trackingFilter} onChange={resetPage(setTrackingFilter)}>
            <option value="">All deliveries</option>
            {Object.entries(TRACKING_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {orders.length === 0 ? (
          <EmptyState title="No orders found" />
        ) : (
          <>
            <Table columns={['Order', 'Customer', 'Amount', 'Payment', 'Delivery', 'Date', '']}>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{order.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{order.shipping?.name || order.user?.name}</p>
                    <p className="text-xs text-slate-400">{order.shipping?.phone || order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(order.total_amount, order.currency)}</td>
                  <td className="px-4 py-3">
                    <Badge status={order.payment_status} />
                    <p className="mt-1 text-xs text-slate-400">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</p>
                  </td>
                  <td className="px-4 py-3">
                    {order.tracking ? (
                      order.tracking.status ? <Badge status={order.tracking.status} /> : <span className="text-xs text-slate-400">Awaiting payment</span>
                    ) : (
                      <span className="text-xs text-slate-400">Digital</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(order.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openOrder(order)} className="text-sm font-medium text-brand-700 hover:underline">
                      {order.tracking ? 'Manage' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.order_number} size="lg">
        {viewing && <OrderManager order={viewing} onChanged={onOrderChanged} />}
      </Modal>
    </div>
  )
}

function OrderManager({ order, onChanged }) {
  const [marking, setMarking] = useState(false)

  const markCodPaid = async () => {
    setMarking(true)
    try {
      const res = await adminService.orders.markCodPaid(order.id)
      onChanged(res.data)
      toast.success(res.message)
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-500">Customer</p>
          <p className="font-medium text-slate-900">{order.user?.name}</p>
          <p className="text-slate-500">{order.user?.email}</p>
        </div>
        <div>
          <p className="text-slate-500">Placed</p>
          <p className="font-medium text-slate-900">{formatDateTime(order.created_at)}</p>
        </div>
        <div>
          <p className="text-slate-500">Payment</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <Badge color="slate">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</Badge>
            <Badge status={order.payment_status} />
          </div>
          {order.razorpay_payment_id && <p className="mt-1 font-mono text-xs text-slate-500">{order.razorpay_payment_id}</p>}
        </div>
        <div>
          <p className="text-slate-500">Total</p>
          <p className="font-semibold text-slate-900">{formatCurrency(order.total_amount, order.currency)}</p>
        </div>
      </div>

      {order.payment_method === 'cod' && order.payment_status !== 'paid' && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-amber-700">
            <Banknote className="h-4 w-4" /> Cash to collect: {formatCurrency(order.total_amount, order.currency)}
          </p>
          <Button size="sm" variant="secondary" loading={marking} onClick={markCodPaid}>
            Mark cash received
          </Button>
        </div>
      )}

      {order.shipping && (
        <div className="rounded-lg border border-slate-200 p-4 text-sm">
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-brand-600" /> Ship to
          </p>
          <p className="font-medium text-slate-800">{order.shipping.name}</p>
          <p className="text-slate-600">{order.shipping.address}</p>
          <p className="text-slate-600">
            {order.shipping.city}, {order.shipping.state} – {order.shipping.pincode}
          </p>
          <a href={`tel:${order.shipping.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-brand-700 hover:underline">
            <Phone className="h-3.5 w-3.5" /> {order.shipping.phone}
          </a>
        </div>
      )}

      {order.tracking?.status && (
        <TrackingForm order={order} onChanged={onChanged} />
      )}

      {order.tracking && <OrderTracking order={order} />}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Items</p>
        <Table columns={['Product', 'Price', 'Qty']}>
          {order.items?.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-slate-900">{item.product_name}</td>
              <td className="px-4 py-3 text-slate-700">{formatCurrency(item.price, order.currency)}</td>
              <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  )
}

function nextStage(status) {
  const i = TRACKING_STAGES.findIndex((s) => s.key === status)
  return TRACKING_STAGES[Math.min(i + 1, TRACKING_STAGES.length - 1)]?.key ?? 'confirmed'
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not supported on this device.'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) }),
      () => reject(new Error('Could not get your location. Please allow location access.')),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  })
}

function TrackingForm({ order, onChanged }) {
  const done = ['delivered', 'cancelled'].includes(order.tracking.status)
  const [form, setForm] = useState({ status: nextStage(order.tracking.status), location: '', note: '', lat: '', lng: '' })
  const [saving, setSaving] = useState(false)
  const [locating, setLocating] = useState(false)
  const [live, setLive] = useState(false)
  const liveRef = useRef(null)
  const orderRef = useRef(order)
  orderRef.current = order

  useEffect(() => {
    setForm((f) => ({ ...f, status: nextStage(order.tracking.status) }))
  }, [order.tracking.status])

  // Live share: ping this device's GPS position every minute while enabled.
  useEffect(() => {
    if (!live) return
    const ping = async () => {
      try {
        const pos = await getPosition()
        const res = await adminService.orders.updateLocation(order.id, pos)
        const latest = orderRef.current
        onChanged({ ...latest, tracking: { ...latest.tracking, lat: res.data.lat, lng: res.data.lng } })
      } catch (error) {
        toast.error(error.message || apiErrorMessage(error))
        setLive(false)
      }
    }
    ping()
    liveRef.current = setInterval(ping, LIVE_PING_MS)
    return () => clearInterval(liveRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, order.id])

  const useMyLocation = async () => {
    setLocating(true)
    try {
      const pos = await getPosition()
      setForm((f) => ({ ...f, lat: String(pos.lat), lng: String(pos.lng) }))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLocating(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        status: form.status,
        location: form.location || null,
        note: form.note || null,
        ...(form.lat && form.lng ? { lat: Number(form.lat), lng: Number(form.lng) } : {}),
      }
      const res = await adminService.orders.updateTracking(order.id, payload)
      onChanged(res.data)
      setForm((f) => ({ ...f, location: '', note: '', lat: '', lng: '' }))
      toast.success(`Marked as ${TRACKING_LABELS[form.status]}`)
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (done) return null

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-brand-300/60 bg-brand-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-900">Update delivery</p>
        <button
          type="button"
          onClick={() => setLive((v) => !v)}
          className={
            live
              ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white'
              : 'inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700'
          }
          title="Share this device's GPS location with the customer every minute"
        >
          <Radio className="h-3.5 w-3.5" /> {live ? 'Sharing live location…' : 'Share live location'}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select label="New status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {TRACKING_STAGES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
          <option value="cancelled">Cancelled</option>
        </Select>
        <Input
          label="Current location"
          placeholder="e.g. Jaipur hub, Rajasthan"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
      <Input label="Note for customer (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
        <Input label="Latitude" inputMode="decimal" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
        <Input label="Longitude" inputMode="decimal" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
        <Button type="button" variant="secondary" loading={locating} onClick={useMyLocation} title="Use this device's location">
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>
      {form.status === 'delivered' && order.payment_method === 'cod' && order.payment_status !== 'paid' && (
        <p className="text-xs text-amber-700">Marking as delivered will also record the cash as collected.</p>
      )}
      <Button type="submit" loading={saving} className="w-full">
        Update to “{TRACKING_LABELS[form.status]}”
      </Button>
    </form>
  )
}
