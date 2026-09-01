import { ArrowDownCircle, ArrowUpCircle, Wallet as WalletIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import Badge from '../../components/ui/Badge'
import { StatCard } from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import Pagination from '../../components/ui/Pagination'
import Table from '../../components/ui/Table'
import { walletService } from '../../services/walletService'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

const sourceLabels = {
  referral_reward: 'Referral reward',
  order_redemption: 'Order redemption',
  admin_adjustment: 'Adjustment',
}

export default function WalletPage() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    walletService.get().then((res) => setWallet(res.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    walletService
      .transactions({ page, per_page: 10 })
      .then((res) => {
        const { items, meta } = unwrapPaginated(res)
        setTransactions(items)
        setMeta(meta)
      })
      .finally(() => setLoading(false))
  }, [page])

  if (!wallet || !transactions) return <FullPageSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Wallet</h1>

      <StatCard
        label="Available balance"
        value={formatCurrency(wallet.balance, wallet.currency)}
        icon={WalletIcon}
        accent="brand"
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-semibold text-slate-900">Transaction History</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No wallet activity yet"
            message="Refer friends or use your wallet at checkout to see transactions here."
          />
        ) : (
          <>
            <Table columns={['Type', 'Source', 'Amount', 'Balance After', 'Date']}>
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Badge color={t.type === 'credit' ? 'green' : 'red'}>
                      <span className="inline-flex items-center gap-1">
                        {t.type === 'credit' ? (
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownCircle className="h-3.5 w-3.5" />
                        )}
                        {t.type}
                      </span>
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {sourceLabels[t.source] || t.source}
                    {t.description && <div className="text-xs text-slate-400">{t.description}</div>}
                  </td>
                  <td className={`px-4 py-3 font-medium ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'credit' ? '+' : '-'}
                    {formatCurrency(t.amount, wallet.currency)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(t.balance_after, wallet.currency)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(t.created_at)}</td>
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
