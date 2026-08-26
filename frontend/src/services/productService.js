import api from './api'

export const productService = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),
  get: (idOrSlug) => api.get(`/products/${idOrSlug}`).then((r) => r.data),

  // admin
  create: (formData) => api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),
  update: (id, formData) => api.post(`/admin/products/${id}?_method=PUT`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),
  remove: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
  toggleStatus: (id) => api.patch(`/admin/products/${id}/toggle-status`).then((r) => r.data),
}
