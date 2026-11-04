import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { Input, Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { apiErrorMessage } from '../../services/api'
import { careerService } from '../../services/careerService'

const emptyForm = { title: '', type: 'Remote · Full-time', summary: '', sort_order: 0, is_active: true }

export default function AdminJobOpeningsPage() {
  const [openings, setOpenings] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => careerService.openingsAdmin.list().then((res) => setOpenings(res.data))

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, sort_order: openings?.length ?? 0 })
    setModalOpen(true)
  }

  const openEdit = (opening) => {
    setEditing(opening)
    setForm({
      title: opening.title,
      type: opening.type || '',
      summary: opening.summary || '',
      sort_order: opening.sort_order,
      is_active: opening.is_active,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 }
      if (editing) await careerService.openingsAdmin.update(editing.id, payload)
      else await careerService.openingsAdmin.create(payload)
      toast.success(editing ? 'Role updated' : 'Role added')
      setModalOpen(false)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (opening) => {
    try {
      const res = await careerService.openingsAdmin.toggle(opening.id)
      toast.success(res.message)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await careerService.openingsAdmin.remove(deleteTarget.id)
      toast.success('Role deleted')
      setDeleteTarget(null)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  if (!openings) return <FullPageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Openings</h1>
          <p className="text-sm text-slate-500">Roles shown on the Careers page. Inactive roles are hidden from visitors.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add role
        </Button>
      </div>

      {openings.length === 0 ? (
        <EmptyState title="No roles yet" message="Add a role and it will appear on the Careers page." />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white">
          <Table columns={['Order', 'Role', 'Type', 'Status', '']}>
            {openings.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{o.sort_order}</td>
                <td className="max-w-md px-4 py-3">
                  <p className="font-medium text-slate-900">{o.title}</p>
                  {o.summary && <p className="truncate text-xs text-slate-500">{o.summary}</p>}
                </td>
                <td className="px-4 py-3 text-slate-700">{o.type || '—'}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => toggle(o)} title="Click to activate / deactivate">
                    <Badge color={o.is_active ? 'green' : 'slate'}>{o.is_active ? 'Active' : 'Inactive'}</Badge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => toggle(o)}>
                      {o.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(o)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(o)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit role' : 'Add role'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="job-opening-form" loading={saving}>
              {editing ? 'Save changes' : 'Add role'}
            </Button>
          </>
        }
      >
        <form id="job-opening-form" onSubmit={handleSubmit} className="space-y-4">
          <Input label="Role title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Performance Marketer" />
          <Input label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Remote · Full-time" />
          <Textarea label="Short description" rows={3} maxLength={500} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="One or two lines about the role." />
          <Input label="Display order" type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 accent-[#ff2e4d]" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active (show on the Careers page)
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete role"
        message={`Delete "${deleteTarget?.title}"? Past applications for it are kept.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  )
}
