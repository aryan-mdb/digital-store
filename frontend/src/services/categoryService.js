import api from './api'

export const categoryService = {
  list: (params) => api.get('/categories', { params }).then((r) => r.data),
  get: (idOrSlug) => api.get(`/categories/${idOrSlug}`).then((r) => r.data),

  // admin
  create: (payload) => api.post('/admin/categories', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),
  update: (id, payload) => api.post(`/admin/categories/${id}?_method=PUT`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),
  remove: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),
  toggleStatus: (id) => api.patch(`/admin/categories/${id}/toggle-status`).then((r) => r.data),
}
