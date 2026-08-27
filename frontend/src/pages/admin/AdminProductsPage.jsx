import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { Input, Select, Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import Table from '../../components/ui/Table'
import { apiErrorMessage } from '../../services/api'
import { categoryService } from '../../services/categoryService'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/format'
import { unwrapPaginated } from '../../utils/pagination'

const emptyForm = {
  name: '',
  category_id: '',
  short_description: '',
  description: '',
  price: '',
  currency: 'USD',
  status: 'active',
  thumbnail: null,
  product_file: null,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    categoryService.list({ per_page: 100 }).then((res) => setCategories(unwrapPaginated(res).items))
  }, [])

  const load = () =>
    productService
      .list({
        page,
        per_page: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
      })
      .then((res) => {
        const { items, meta } = unwrapPaginated(res)
        setProducts(items)
        setMeta(meta)
      })

  useEffect(() => {
    load()
  }, [page, statusFilter, categoryFilter])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name,
      category_id: product.category?.id || '',
      short_description: product.short_description || '',
      description: product.description || '',
      price: product.price,
      currency: product.currency,
      status: product.status,
      thumbnail: null,
      product_file: null,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editing && !form.product_file) {
      toast.error('A downloadable file is required')
      return
    }

    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('name', form.name)
      payload.append('category_id', form.category_id)
      payload.append('short_description', form.short_description || '')
      payload.append('description', form.description || '')
      payload.append('price', form.price)
      payload.append('currency', form.currency || 'USD')
      payload.append('status', form.status)
      if (form.thumbnail) payload.append('thumbnail', form.thumbnail)
      if (form.product_file) payload.append('product_file', form.product_file)

      if (editing) {
        await productService.update(editing.id, payload)
        toast.success('Product updated successfully')
      } else {
        await productService.create(payload)
        toast.success('Product created successfully')
      }
      setModalOpen(false)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (product) => {
    try {
      await productService.toggleStatus(product.id)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productService.remove(deleteTarget.id)
      toast.success('Product deleted successfully')
      setDeleteTarget(null)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  if (!products) return <FullPageSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

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
            placeholder="Search products..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </form>
        <Select value={categoryFilter} onChange={(e) => { setPage(1); setCategoryFilter(e.target.value) }} className="sm:w-48">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="sm:w-40">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {products.length === 0 ? (
          <EmptyState title="No products found" action={<Button onClick={openCreate}>Add your first product</Button>} />
        ) : (
          <>
            <Table columns={['Product', 'Category', 'Price', 'Sales', 'Status', '']}>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.thumbnail_url ? (
                        <img src={product.thumbnail_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100" />
                      )}
                      <p className="font-medium text-slate-900">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3">{formatCurrency(product.price, product.currency)}</td>
                  <td className="px-4 py-3">{product.sales_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(product)}>
                      <Badge status={product.status} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(product)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editing ? 'Save Changes' : 'Create Product'}</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <Select label="Category" required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Textarea
            label="Short Description"
            rows={2}
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          />
          <Textarea
            label="Description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            />
          </div>

          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>

          <Input
            label="Thumbnail"
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })}
          />
          <Input
            label={editing ? 'Downloadable File (leave blank to keep current)' : 'Downloadable File'}
            type="file"
            required={!editing}
            onChange={(e) => setForm({ ...form, product_file: e.target.files[0] })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  )
}
