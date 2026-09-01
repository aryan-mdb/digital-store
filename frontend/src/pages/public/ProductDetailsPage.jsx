import { Bitcoin, CheckCircle2, ImageOff, ShoppingCart, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { useAuth } from '../../context/AuthContext'
import { apiErrorMessage } from '../../services/api'
import { orderService } from '../../services/orderService'
import { productService } from '../../services/productService'
import { walletService } from '../../services/walletService'
import { formatCurrency } from '../../utils/format'

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [buying, setBuying] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [useWallet, setUseWallet] = useState(false)

  useEffect(() => {
    productService.get(slug).then((res) => setProduct(res.data))
  }, [slug])

  useEffect(() => {
    if (!user || user.role === 'admin') return
    walletService.get().then((res) => setWallet(res.data)).catch(() => setWallet(null))
  }, [user])

  if (!product) return <FullPageSpinner />

  const walletCovers = wallet && wallet.balance > 0 ? Math.min(wallet.balance, product.price) : 0
  const remainingAfterWallet = Math.max(product.price - walletCovers, 0)

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${slug}` } } })
      return
    }
    if (user.role === 'admin') {
      toast.error('Admin accounts cannot make purchases.')
      return
    }

    setBuying(true)
    try {
      const { data: order } = await orderService.create(product.id, useWallet)
      if (order.payment_status === 'paid') {
        toast.success('Order placed and paid using your wallet balance!')
        navigate(`/dashboard/orders/${order.id}`)
      } else {
        navigate(`/dashboard/payments/${order.id}`)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
          {product.thumbnail_url ? (
            <img src={product.thumbnail_url} alt={product.name} className="h-full w-full rounded-xl object-cover" />
          ) : (
            <ImageOff className="h-12 w-12 text-slate-300" />
          )}
        </div>

        <div>
          {product.category?.name && <Badge color="blue">{product.category.name}</Badge>}
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-2 text-slate-600">{product.short_description}</p>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{formatCurrency(product.price, product.currency)}</span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Bitcoin className="h-4 w-4 text-amber-500" /> Payable with cryptocurrency{wallet?.balance > 0 ? ' or wallet balance' : ' only'}
          </div>

          {!product.is_purchased && wallet?.balance > 0 && (
            <label className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={useWallet}
                onChange={(e) => setUseWallet(e.target.checked)}
              />
              <span className="flex-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <WalletCards className="h-4 w-4 text-brand-500" /> Use wallet balance ({formatCurrency(wallet.balance, wallet.currency)} available)
                </span>
                {useWallet && (
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {remainingAfterWallet > 0
                      ? `${formatCurrency(walletCovers, wallet.currency)} from wallet, ${formatCurrency(remainingAfterWallet, product.currency)} remaining via crypto`
                      : `Fully covered by your wallet — no crypto payment needed`}
                  </span>
                )}
              </span>
            </label>
          )}

          <div className="mt-6">
            {product.is_purchased ? (
              <Button variant="secondary" className="w-full" disabled>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Already purchased
              </Button>
            ) : (
              <Button className="w-full" size="lg" loading={buying} onClick={handleBuyNow}>
                <ShoppingCart className="h-4 w-4" /> Buy Now
              </Button>
            )}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="mb-2 font-semibold text-slate-900">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
