import clsx from 'clsx'
import { Banknote, Bitcoin, CheckCircle2, CreditCard, Lock, MapPin, ShieldCheck, WalletCards } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import ImagePlaceholder from '../../components/ui/ImagePlaceholder'
import { Input, Textarea } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import usePageMeta from '../../hooks/usePageMeta'
import { apiErrorMessage } from '../../services/api'
import { orderService } from '../../services/orderService'
import { productService } from '../../services/productService'
import { walletService } from '../../services/walletService'
import { formatCurrency } from '../../utils/format'
import { payWithRazorpay } from '../../utils/razorpay'

const ADDRESS_KEY = 'last_shipping_address'

const METHODS = [
  { key: 'razorpay', title: 'Pay Online', desc: 'UPI, cards, netbanking & wallets via Razorpay', icon: CreditCard },
  { key: 'cod', title: 'Cash on Delivery', desc: 'Pay in cash when your order arrives', icon: Banknote, physicalOnly: true },
  { key: 'crypto', title: 'Cryptocurrency', desc: 'Pay with USDT and other coins', icon: Bitcoin },
]

function loadSavedAddress() {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_KEY)) || null
  } catch {
    return null
  }
}

export default function CheckoutPage() {
  usePageMeta('Checkout')
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { payment_methods: enabled, loaded } = useSiteSettings()

  const [product, setProduct] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [useWallet, setUseWallet] = useState(false)
  const [method, setMethod] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [shipping, setShipping] = useState(
    () => loadSavedAddress() || { name: user?.name || '', phone: '', address: '', city: '', state: '', pincode: '' }
  )

  useEffect(() => {
    productService.get(slug).then((res) => setProduct(res.data))
    walletService.get().then((res) => setWallet(res.data)).catch(() => setWallet(null))
  }, [slug])

  const isPhysical = product ? !product.has_file : false
  const available = useMemo(
    () => METHODS.filter((m) => enabled?.[m.key] && (!m.physicalOnly || isPhysical)),
    [enabled, isPhysical]
  )

  useEffect(() => {
    if (!available.find((m) => m.key === method)) setMethod(available[0]?.key ?? null)
  }, [available, method])

  if (!product || !loaded) return <FullPageSpinner />

  const walletCovers = useWallet && wallet?.balance > 0 ? Math.min(wallet.balance, product.price) : 0
  const payable = Math.max(product.price - walletCovers, 0)
  const fullyCovered = useWallet && payable <= 0

  const setField = (key) => (e) => setShipping((s) => ({ ...s, [key]: e.target.value }))

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!fullyCovered && !method) {
      toast.error('Please choose a payment method')
      return
    }

    setPlacing(true)
    try {
      if (isPhysical) localStorage.setItem(ADDRESS_KEY, JSON.stringify(shipping))

      const { data: order } = await orderService.create({
        productId: product.id,
        useWallet,
        paymentMethod: method || 'crypto',
        shipping: isPhysical ? shipping : undefined,
      })

      if (order.payment_status === 'paid') {
        toast.success('Order placed and paid using your wallet balance!')
        navigate(`/dashboard/orders/${order.id}`)
      } else if (order.payment_method === 'cod') {
        toast.success('Order placed! Pay in cash on delivery.')
        navigate(`/dashboard/orders/${order.id}`)
      } else if (order.payment_method === 'razorpay') {
        try {
          const result = await payWithRazorpay(order.id)
          if (result.status === 'paid') toast.success('Payment successful!')
          else toast('Payment not completed. You can pay any time from your order page.', { icon: '⏳' })
        } catch (err) {
          toast.error(err?.response ? apiErrorMessage(err) : err.message)
        }
        navigate(`/dashboard/orders/${order.id}`)
      } else {
        navigate(`/dashboard/payments/${order.id}`)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">Secure checkout</p>
        <h1 className="mt-1 text-3xl font-bold text-maroon-ink sm:text-4xl">Complete your order</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {isPhysical && (
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <MapPin className="h-5 w-5 text-brand-600" /> Delivery address
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Full name" required value={shipping.name} onChange={setField('name')} />
                <Input
                  label="Mobile number"
                  type="tel"
                  required
                  pattern="[0-9+\-\s]{7,20}"
                  placeholder="10-digit mobile number"
                  value={shipping.phone}
                  onChange={setField('phone')}
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="House no., street, area, landmark"
                    required
                    rows={2}
                    value={shipping.address}
                    onChange={setField('address')}
                  />
                </div>
                <Input label="City" required value={shipping.city} onChange={setField('city')} />
                <Input label="State" required value={shipping.state} onChange={setField('state')} />
                <Input label="PIN code" required inputMode="numeric" value={shipping.pincode} onChange={setField('pincode')} />
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Lock className="h-5 w-5 text-brand-600" /> Payment method
            </h2>

            {available.length === 0 ? (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                No payment method is available for this product right now. Please contact us.
              </p>
            ) : (
              <div className={clsx('space-y-3', fullyCovered && 'pointer-events-none opacity-50')}>
                {available.map((m) => (
                  <label
                    key={m.key}
                    className={clsx(
                      'flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition',
                      method === m.key ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={m.key}
                      checked={method === m.key}
                      onChange={() => setMethod(m.key)}
                      className="sr-only"
                    />
                    <span
                      className={clsx(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                        method === m.key ? 'bg-gold-foil text-maroon-900' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      <m.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-slate-900">{m.title}</span>
                      <span className="block text-sm text-slate-500">{m.desc}</span>
                    </span>
                    {method === m.key && <CheckCircle2 className="h-5 w-5 text-brand-600" />}
                  </label>
                ))}
              </div>
            )}

            {wallet?.balance > 0 && (
              <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <input type="checkbox" className="mt-1 accent-[#a67a1e]" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} />
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 font-medium text-slate-800">
                    <WalletCards className="h-4 w-4 text-brand-600" /> Use wallet balance (
                    {formatCurrency(wallet.balance, wallet.currency)} available)
                  </span>
                  {fullyCovered && <span className="text-xs text-slate-500">Fully covered by your wallet — no payment needed.</span>}
                </span>
              </label>
            )}
          </Card>
        </div>

        <div>
          <div className="card-label sticky top-24 rounded-2xl">
            <div className="ornament-band rounded-t-2xl" />
            <div className="p-6">
              <h2 className="mb-4 text-center text-lg font-bold text-maroon-ink">Order summary</h2>
              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {product.thumbnail_url ? (
                    <img src={product.thumbnail_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlaceholder iconClassName="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="line-clamp-2 text-sm text-slate-500">{product.short_description}</p>
                </div>
              </div>

              <dl className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
                <Row label="Price" value={formatCurrency(product.price, product.currency)} />
                {walletCovers > 0 && <Row label="Wallet" value={`− ${formatCurrency(walletCovers, product.currency)}`} />}
                {isPhysical && <Row label="Delivery" value={<span className="font-semibold text-leaf-600">FREE</span>} />}
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <dt className="font-semibold text-slate-900">Total</dt>
                  <dd className="font-display text-2xl font-bold text-maroon-ink">{formatCurrency(payable, product.currency)}</dd>
                </div>
              </dl>

              <Button type="submit" size="lg" className="mt-5 w-full" loading={placing} disabled={!fullyCovered && !method}>
                {fullyCovered
                  ? 'Place Order'
                  : method === 'cod'
                    ? 'Place Order (Pay on Delivery)'
                    : method === 'razorpay'
                      ? `Pay ${formatCurrency(payable, product.currency)}`
                      : 'Continue to Payment'}
              </Button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-leaf-500" /> 100% secure payments
              </p>
              <Link to={`/products/${product.slug}`} className="mt-2 block text-center text-xs text-slate-500 hover:underline">
                ← Back to product
              </Link>
            </div>
            <div className="ornament-band flip rounded-b-2xl" />
          </div>
        </div>
      </form>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  )
}
