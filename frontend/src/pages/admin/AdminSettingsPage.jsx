import clsx from 'clsx'
import { AlertTriangle, Banknote, Bitcoin, CreditCard, Gift, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { adminService } from '../../services/adminService'
import { apiErrorMessage } from '../../services/api'
import { authService } from '../../services/authService'

export default function AdminSettingsPage() {
  const { user, refreshUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [rewardPercentage, setRewardPercentage] = useState('')
  const [loadingReferral, setLoadingReferral] = useState(true)
  const [savingReferral, setSavingReferral] = useState(false)

  const { refresh: refreshSiteSettings } = useSiteSettings()
  const [store, setStore] = useState(null)
  const [savingStore, setSavingStore] = useState(false)

  useEffect(() => {
    adminService.storeSettings.get().then((res) => setStore(res.data))
  }, [])

  const saveStore = async (patch) => {
    const next = { ...store, ...patch, payment_methods: { ...store.payment_methods, ...patch.payment_methods } }
    setStore(next)
    setSavingStore(true)
    try {
      const res = await adminService.storeSettings.update({
        payment_methods: next.payment_methods,
        whatsapp_enabled: next.whatsapp_enabled,
        whatsapp_number: next.whatsapp_number,
        whatsapp_message: next.whatsapp_message,
      })
      setStore(res.data)
      refreshSiteSettings()
      if (res.message?.startsWith('Saved —')) toast(res.message, { icon: '⚠️' })
      else toast.success(res.message)
    } catch (error) {
      toast.error(apiErrorMessage(error))
      adminService.storeSettings.get().then((r) => setStore(r.data))
    } finally {
      setSavingStore(false)
    }
  }

  useEffect(() => {
    adminService.referralSettings
      .get()
      .then((res) => setRewardPercentage(String(res.data.reward_percentage)))
      .finally(() => setLoadingReferral(false))
  }, [])

  const handleReferralSubmit = async (e) => {
    e.preventDefault()
    setSavingReferral(true)
    try {
      const { data } = await adminService.referralSettings.update({ reward_percentage: Number(rewardPercentage) })
      setRewardPercentage(String(data.reward_percentage))
      toast.success('Refer & Earn reward updated successfully')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSavingReferral(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await authService.updateProfile(profileForm)
      await refreshUser()
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    try {
      await authService.changePassword(passwordForm)
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <Card className="p-6">
        <h2 className="mb-1 flex items-center gap-2 font-semibold text-slate-900">
          <CreditCard className="h-4 w-4 text-brand-600" /> Payment Methods
        </h2>
        <p className="mb-4 text-sm text-slate-500">Switch a method off and it disappears from checkout immediately.</p>
        {!store ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            <MethodRow
              icon={CreditCard}
              title="Razorpay"
              desc="UPI, cards, netbanking & wallets"
              checked={store.payment_methods.razorpay}
              disabled={savingStore}
              onChange={(v) => saveStore({ payment_methods: { razorpay: v } })}
              warning={
                !store.razorpay_configured &&
                'Razorpay keys are not set on the server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in backend .env), so it stays hidden from customers.'
              }
            />
            <MethodRow
              icon={Banknote}
              title="Cash on Delivery"
              desc="Customer pays in cash when the order is delivered"
              checked={store.payment_methods.cod}
              disabled={savingStore}
              onChange={(v) => saveStore({ payment_methods: { cod: v } })}
            />
            <MethodRow
              icon={Bitcoin}
              title="Cryptocurrency"
              desc="USDT and other coins via NOWPayments"
              checked={store.payment_methods.crypto}
              disabled={savingStore}
              onChange={(v) => saveStore({ payment_methods: { crypto: v } })}
            />
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp Chat
          </h2>
          {store && (
            <Switch checked={store.whatsapp_enabled} disabled={savingStore} onChange={(v) => saveStore({ whatsapp_enabled: v })} />
          )}
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Shows a floating WhatsApp button on the store, an &ldquo;Order on WhatsApp&rdquo; button on product pages and a
          &ldquo;Need help?&rdquo; button on orders.
        </p>
        {store && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveStore({})
            }}
            className="space-y-4"
          >
            <Input
              label="WhatsApp number (with country code)"
              placeholder="91 98765 43210"
              value={store.whatsapp_number}
              onChange={(e) => setStore({ ...store, whatsapp_number: e.target.value })}
            />
            <Textarea
              label="Default greeting message"
              rows={2}
              value={store.whatsapp_message}
              onChange={(e) => setStore({ ...store, whatsapp_message: e.target.value })}
            />
            <Button type="submit" loading={savingStore}>
              Save WhatsApp Settings
            </Button>
          </form>
        )}
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Admin Account</h2>
          <Badge status={user?.role} />
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Full name"
            required
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
          />
          <Button type="submit" loading={savingProfile}>
            Save Changes
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
          <Gift className="h-4 w-4 text-brand-500" /> Affiliate Program (Refer & Earn)
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          When a referred user makes their first purchase, this percentage of that order is credited to the
          referrer's wallet. Applies live to every reward from now on — existing pending referrals use whatever
          value is set when their friend actually completes a purchase.
        </p>
        <form onSubmit={handleReferralSubmit} className="space-y-4">
          <Input
            label="Reward percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            required
            disabled={loadingReferral}
            value={rewardPercentage}
            onChange={(e) => setRewardPercentage(e.target.value)}
          />
          <Button type="submit" loading={savingReferral} disabled={loadingReferral}>
            Save Reward %
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            required
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            value={passwordForm.password}
            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            value={passwordForm.password_confirmation}
            onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
          />
          <Button type="submit" loading={savingPassword}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  )
}

function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60',
        checked ? 'bg-leaf-500' : 'bg-slate-300'
      )}
    >
      <span
        className={clsx(
          'inline-block h-5 w-5 rounded-full bg-[#fffaee] shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

function MethodRow({ icon: Icon, title, desc, checked, onChange, disabled, warning }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{desc}</p>
        </div>
        <span className={clsx('text-xs font-semibold', checked ? 'text-leaf-500' : 'text-slate-400')}>
          {checked ? 'Active' : 'Inactive'}
        </span>
        <Switch checked={checked} onChange={onChange} disabled={disabled} />
      </div>
      {warning && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {warning}
        </p>
      )}
    </div>
  )
}
