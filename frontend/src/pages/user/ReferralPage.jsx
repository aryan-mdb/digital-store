import { Copy, Gift, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import { StatCard } from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import Pagination from '../../components/ui/Pagination'
import Table from '../../components/ui/Table'
import { referralService } from '../../services/referralService'
import { formatCurrency, formatDateTime } from '../../utils/format'

export default function ReferralPage() {
  const [summary, setSummary] = useState(null)
  const [referrals, setReferrals] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    referralService
      .get({ page, per_page: 10 })
      .then((res) => {
        const { referral_code, reward_percentage, total_referred, total_earned, referrals: paginated } = res.data
        setSummary({ referral_code, reward_percentage, total_referred, total_earned })
        setReferrals(paginated.data)
        setMeta({
          current_page: paginated.current_page,
          last_page: paginated.last_page,
          total: paginated.total,
        })
      })
      .finally(() => setLoading(false))
  }, [page])

  if (!summary || !referrals) return <FullPageSpinner />

  const referralLink = `${window.location.origin}/register?ref=${summary.referral_code}`

  const copy = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Refer & Earn</h1>
        <p className="mt-1 text-sm text-slate-500">
          Share your link — when a friend makes their first purchase, you get {summary.reward_percentage}% of that
          order credited straight to your wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Friends referred" value={summary.total_referred} icon={Users} accent="blue" />
        <StatCard label="Total earned" value={formatCurrency(summary.total_earned)} icon={TrendingUp} accent="green" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
          <Gift className="h-4 w-4 text-brand-500" /> Your referral link
        </h2>

        <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <code className="flex-1 truncate text-xs text-slate-700">{referralLink}</code>
          <button
            onClick={() => copy(referralLink, 'Referral link')}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Copy referral link"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-500">Code:</span>
          <code className="flex-1 font-mono text-sm font-semibold text-slate-900">{summary.referral_code}</code>
          <button
            onClick={() => copy(summary.referral_code, 'Referral code')}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Copy referral code"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-semibold text-slate-900">Your Referrals</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
        ) : referrals.length === 0 ? (
          <EmptyState title="No referrals yet" message="Share your link above to start earning." />
        ) : (
          <>
            <Table columns={['Friend', 'Status', 'Reward', 'Joined']}>
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.referred_user_name || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge color={r.status === 'rewarded' ? 'green' : 'amber'}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {r.reward_amount !== null ? formatCurrency(r.reward_amount) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(r.created_at)}</td>
                </tr>
              ))}
            </Table>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
