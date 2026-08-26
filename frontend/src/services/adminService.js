import api from './api'

export const adminService = {
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data),

  users: {
    list: (params) => api.get('/admin/users', { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
    orders: (id, params) => api.get(`/admin/users/${id}/orders`, { params }).then((r) => r.data),
    update: (id, payload) => api.put(`/admin/users/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  },

  orders: {
    list: (params) => api.get('/admin/orders', { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/orders/${id}`).then((r) => r.data),
  },

  payments: {
    list: (params) => api.get('/admin/payments', { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/payments/${id}`).then((r) => r.data),
  },

  transactions: {
    list: (params) => api.get('/admin/transactions', { params }).then((r) => r.data),
  },
}
