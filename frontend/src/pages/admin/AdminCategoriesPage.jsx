import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { Input, Select, Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { apiErrorMessage } from '../../services/api'
import { categoryService } from '../../services/categoryService'
import { unwrapPaginated } from '../../utils/pagination'

const emptyForm = { name: '', description: '', status: 'active', image: null }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => categoryService.list({ per_page: 100 }).then((res) => setCategories(unwrapPaginated(res).items))

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (category) => {
    setEditing(category)
    setForm({ name: category.name, description: category.description || '', status: category.status, image: null })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('name', form.name)
      payload.append('description', form.description || '')
      payload.append('status', form.status)
      if (form.image) payload.append('image', form.image)

      if (editing) {
        await categoryService.update(editing.id, payload)
        toast.success('Category updated successfully')
      } else {
        await categoryService.create(payload)
        toast.success('Category created successfully')
      }
      setModalOpen(false)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (category) => {
    try {
      await categoryService.toggleStatus(category.id)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await categoryService.remove(deleteTarget.id)
      toast.success('Category deleted successfully')
      setDeleteTarget(null)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {!categories ? null : categories.length === 0 ? (
          <EmptyState title="No categories yet" action={<Button onClick={openCreate}>Add your first category</Button>} />
        ) : (
          <Table columns={['Name', 'Products', 'Status', '']}>
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{category.name}</p>
                  <p className="line-clamp-1 text-xs text-slate-500">{category.description}</p>
                </td>
                <td className="px-4 py-3">{category.products_count ?? 0}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(category)}>
                    <Badge status={category.status} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(category)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(category)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editing ? 'Save Changes' : 'Create Category'}</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Input
            label="Image"
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  )
}
