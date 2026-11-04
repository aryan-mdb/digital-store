import { Download, ExternalLink, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import Table from '../../components/ui/Table'
import { apiErrorMessage } from '../../services/api'
import { careerService } from '../../services/careerService'
import { formatDateTime } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

const STATUSES = ['new', 'reviewed', 'shortlisted', 'rejected']
const STATUS_COLOR = { new: 'blue', reviewed: 'slate', shortlisted: 'green', rejected: 'red' }

export default function AdminCareersPage() {
  const [apps, setApps] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewing, setViewing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () =>
    careerService.admin
      .list({ page, per_page: 15, search: search || undefined, status: statusFilter || undefined })
      .then((res) => {
        const { items, meta } = unwrapPaginated(res)
        setApps(items)
        setMeta(meta)
      })

  useEffect(() => {
    load()
  }, [page, statusFilter])

  const changeStatus = async (app, status) => {
    try {
      await careerService.admin.setStatus(app.id, status)
      setApps((list) => list.map((a) => (a.id === app.id ? { ...a, status } : a)))
      setViewing((v) => (v?.id === app.id ? { ...v, status } : v))
      toast.success('Status updated')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const downloadCv = async (app) => {
    try {
      await careerService.admin.downloadCv(app)
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await careerService.admin.remove(deleteTarget.id)
      toast.success('Application deleted')
      setDeleteTarget(null)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  if (!apps) return <FullPageSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job Applications</h1>
        <p className="text-sm text-slate-500">Applications submitted from the Careers page.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
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
            placeholder="Search name, email or role…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none"
          />
        </form>
        <Select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="sm:w-44">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      {apps.length === 0 ? (
        <EmptyState title="No applications yet" message="They will appear here when someone applies on the Careers page." />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white">
          <Table columns={['Applicant', 'Role', 'Experience', 'Applied', 'Status', '']}>
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <button type="button" onClick={() => setViewing(app)} className="text-left">
                    <p className="font-medium text-slate-900 hover:text-brand-500">{app.name}</p>
                    <p className="text-xs text-slate-500">{app.email}</p>
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-700">{app.role}</td>
                <td className="px-4 py-3 text-slate-700">{app.experience != null ? `${app.experience} yrs` : '—'}</td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(app.created_at)}</td>
                <td className="px-4 py-3">
                  <Badge color={STATUS_COLOR[app.status]}>{app.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => downloadCv(app)} title="Download CV">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(app)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name}>
        {viewing && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2">
              <dt className="text-slate-500">Role</dt>
              <dd className="text-slate-900">{viewing.role}</dd>
              <dt className="text-slate-500">Email</dt>
              <dd><a href={`mailto:${viewing.email}`} className="text-brand-500 hover:underline">{viewing.email}</a></dd>
              <dt className="text-slate-500">Phone</dt>
              <dd className="text-slate-900">{viewing.phone || '—'}</dd>
              <dt className="text-slate-500">City</dt>
              <dd className="text-slate-900">{viewing.city || '—'}</dd>
              <dt className="text-slate-500">Experience</dt>
              <dd className="text-slate-900">{viewing.experience != null ? `${viewing.experience} years` : '—'}</dd>
              <dt className="text-slate-500">LinkedIn</dt>
              <dd>
                <a href={viewing.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-brand-500 hover:underline">
                  Open profile <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </dd>
            </dl>
            {viewing.message && (
              <div>
                <p className="mb-1 text-slate-500">Why LERN?</p>
                <p className="whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-slate-800">{viewing.message}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
              <Select value={viewing.status} onChange={(e) => changeStatus(viewing, e.target.value)} className="w-40">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </Select>
              <Button size="sm" onClick={() => downloadCv(viewing)}>
                <Download className="h-4 w-4" /> Download CV
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete application?"
        message={`This permanently removes ${deleteTarget?.name}'s application and CV.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
