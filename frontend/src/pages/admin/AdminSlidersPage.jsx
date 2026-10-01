import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { Input } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { adminService } from '../../services/adminService'
import { apiErrorMessage } from '../../services/api'

const emptyForm = { title: '', subtitle: '', button_text: '', button_link: '', sort_order: 0, is_active: true, image: null }

export default function AdminSlidersPage() {
  const [sliders, setSliders] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => adminService.sliders.list().then((res) => setSliders(res.data))

  useEffect(() => {
    load()
  }, [])

  // Revoke object URLs for picked files so they don't leak.
  useEffect(() => () => preview?.startsWith('blob:') && URL.revokeObjectURL(preview), [preview])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, sort_order: sliders?.length ?? 0 })
    setPreview(null)
    setModalOpen(true)
  }

  const openEdit = (slide) => {
    setEditing(slide)
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      button_text: slide.button_text || '',
      button_link: slide.button_link || '',
      sort_order: slide.sort_order ?? 0,
      is_active: slide.is_active,
      image: null,
    })
    setPreview(slide.image_url)
    setModalOpen(true)
  }

  const pickImage = (file) => {
    if (!file) return
    setForm((f) => ({ ...f, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editing && !form.image) {
      toast.error('Please choose a banner image')
      return
    }
    setSaving(true)
    try {
      const payload = new FormData()
      ;['title', 'subtitle', 'button_text', 'button_link'].forEach((k) => payload.append(k, form[k] || ''))
      payload.append('sort_order', String(form.sort_order || 0))
      payload.append('is_active', form.is_active ? '1' : '0')
      if (form.image) payload.append('image', form.image)

      if (editing) {
        await adminService.sliders.update(editing.id, payload)
        toast.success('Slide updated')
      } else {
        await adminService.sliders.create(payload)
        toast.success('Slide added')
      }
      setModalOpen(false)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (slide) => {
    try {
      await adminService.sliders.toggleStatus(slide.id)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminService.sliders.remove(deleteTarget.id)
      toast.success('Slide deleted')
      setDeleteTarget(null)
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  if (!sliders) return <FullPageSpinner />

  const activeCount = sliders.filter((s) => s.is_active).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homepage Sliders</h1>
          <p className="text-sm text-slate-500">
            {activeCount > 0
              ? `${activeCount} active slide${activeCount > 1 ? 's' : ''} showing on the homepage.`
              : 'No active slides — the homepage is showing the built-in animated slides.'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Slide
        </Button>
      </div>

      {sliders.length === 0 ? (
        <Card>
          <EmptyState
            icon={ImagePlus}
            title="No slides uploaded yet"
            message="Upload banner images (recommended 1920×700) to replace the default animated slides on the homepage."
            action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Upload first slide</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sliders.map((slide) => (
            <Card key={slide.id} className="overflow-hidden">
              <div className="relative aspect-[16/7] bg-slate-100">
                {slide.image_url && <img src={slide.image_url} alt="" className="h-full w-full object-cover" />}
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                  #{slide.sort_order}
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{slide.title || <span className="italic text-slate-400">No title</span>}</p>
                    {slide.subtitle && <p className="line-clamp-2 text-sm text-slate-500">{slide.subtitle}</p>}
                  </div>
                  <Badge status={slide.is_active ? 'active' : 'inactive'} />
                </div>
                {slide.button_text && (
                  <p className="text-xs text-slate-500">
                    Button: <strong>{slide.button_text}</strong> → {slide.button_link}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(slide)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleToggle(slide)}>
                    {slide.is_active ? 'Hide' : 'Show'}
                  </Button>
                  <Button size="sm" variant="ghost" className="ml-auto text-red-600" onClick={() => setDeleteTarget(slide)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Slide' : 'Add Slide'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="slider-form" loading={saving}>{editing ? 'Save Changes' : 'Add Slide'}</Button>
          </>
        }
      >
        <form id="slider-form" onSubmit={handleSubmit} className="space-y-4">
          <label className="block cursor-pointer">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Banner image {editing && '(leave empty to keep current)'}</span>
            <div className="relative flex aspect-[16/7] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-brand-400">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-sm text-slate-500">
                  <ImagePlus className="mx-auto mb-1 h-8 w-8 text-slate-400" />
                  Click to upload · JPG/PNG/WebP up to 8 MB
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickImage(e.target.files[0])} />
          </label>

          <Input label="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Subtitle (optional)" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Button text (optional)"
              placeholder="Shop Now"
              value={form.button_text}
              onChange={(e) => setForm({ ...form, button_text: e.target.value })}
            />
            <Input
              label="Button link"
              placeholder="/products or https://..."
              value={form.button_link}
              onChange={(e) => setForm({ ...form, button_link: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Display order"
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
            <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#a67a1e]"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Show on homepage
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        danger
        title="Delete slide?"
        message="This banner will be removed from the homepage permanently."
        confirmLabel="Delete"
      />
    </div>
  )
}
