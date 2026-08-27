import { Pencil, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { Select } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import Table from '../../components/ui/Table'
import { apiErrorMessage } from '../../services/api'
import { adminService } from '../../services/adminService'
import { formatDate } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

export default function AdminUsersPage() {
  const [users, setUsers] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ role: '', status: '' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () =>
    adminService.users
      .list({
        page,
        per_page: 15,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      .then((res) => {
        const { items, meta } = unwrapPaginated(res)
        setUsers(items)
        setMeta(meta)
      })

  useEffect(() => {
    load()
  }, [page, roleFilter, statusFilter])

  const openEdit = (user) => {
    setEditing(user)
    setForm({ role: user.role, status: user.status })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminService.users.update(editing.id, form)
      toast.success('User updated successfully')
      setEditing(null)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminService.users.remove(deleteTarget.id)
      toast.success('User deleted successfully')
      setDeleteTarget(null)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  if (!users) return <FullPageSpinner />

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Users</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </form>
        <Select value={roleFilter} onChange={(e) => { setPage(1); setRoleFilter(e.target.value) }} className="sm:w-40">
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="basic_user">User</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="sm:w-40">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <>
            <Table columns={['Name', 'Email', 'Role', 'Status', 'Orders', 'Joined', '']}>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3"><Badge status={user.role} /></td>
                  <td className="px-4 py-3"><Badge status={user.status} /></td>
                  <td className="px-4 py-3">{user.orders_count ?? 0}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(user)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(user)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.name || 'User'}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>Save Changes</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="basic_user">User</option>
          </Select>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </Select>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  )
}
