import { Banknote, Bitcoin, CheckCircle2, CreditCard, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { WhatsAppIcon } from '../../components/WhatsAppButton'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import ImagePlaceholder from '../../components/ui/ImagePlaceholder'
import { useAuth } from '../../context/AuthContext'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/format'
import { whatsappLink } from '../../utils/whatsapp'
import usePageMeta from '../../hooks/usePageMeta'

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { payment_methods: methods, whatsapp } = useSiteSettings()
  const [product, setProduct] = useState(null)
  const [imgFailed, setImgFailed] = useState(false)

  usePageMeta(product?.name, product?.short_description)

  useEffect(() => {
    productService.get(slug).then((res) => setProduct(res.data))
  }, [slug])

  if (!product) return <FullPageSpinner />

  const isPhysical = !product.has_file

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/checkout/${slug}` } } })
      return
    }
    if (user.role === 'admin') {
      toast.error('Admin accounts cannot make purchases.')
      return
    }
    navigate(`/checkout/${slug}`)
  }

  const waOrderLink = whatsapp?.enabled
    ? whatsappLink(
        whatsapp.number,
        `Hi! I'd like to order "${product.name}" (${formatCurrency(product.price, product.currency)}).\n${window.location.href}`
      )
    : null

  const payOptions = [
    methods?.razorpay && { icon: CreditCard, label: 'UPI / Cards / Netbanking' },
    methods?.cod && isPhysical && { icon: Banknote, label: 'Cash on Delivery' },
    methods?.crypto && { icon: Bitcoin, label: 'Crypto' },
  ].filter(Boolean)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="card-label relative overflow-hidden rounded-2xl p-3">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-slate-100 sm:aspect-[4/3]">
            {product.thumbnail_url && !imgFailed ? (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            ) : (
              <ImagePlaceholder iconClassName="h-12 w-12" />
            )}
          </div>
        </div>

        <div>
          {product.category?.name && <Badge color="amber">{product.category.name}</Badge>}
          <h1 className="mt-3 text-3xl font-bold leading-tight text-forest-ink sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-slate-600">{product.short_description}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-slate-900">{formatCurrency(product.price, product.currency)}</span>
            <span className="text-sm text-slate-500">incl. of all taxes</span>
          </div>

          {payOptions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {payOptions.map((o) => (
                <span
                  key={o.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  <o.icon className="h-3.5 w-3.5 text-brand-600" /> {o.label}
                </span>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {product.is_purchased ? (
              <Button variant="secondary" className="w-full" disabled>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Already purchased
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={handleBuyNow}>
                <ShoppingCart className="h-4 w-4" /> Buy Now
              </Button>
            )}
            {waOrderLink && (
              <a href={waOrderLink} target="_blank" rel="noreferrer" className="w-full">
                <Button variant="whatsapp" size="lg" className="w-full">
                  <WhatsAppIcon className="h-5 w-5" /> Order on WhatsApp
                </Button>
              </a>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
            <Perk icon={ShieldCheck} label="Secure payments" />
            <Perk icon={Truck} label={isPhysical ? 'Doorstep delivery' : 'Instant download'} />
            <Perk icon={CheckCircle2} label="Quality assured" />
          </div>

          {product.description && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Description</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Perk({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3">
      <Icon className="h-5 w-5 text-brand-600" />
      <span className="font-medium text-slate-700">{label}</span>
    </div>
  )
}
