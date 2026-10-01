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
    updateTracking: (id, payload) => api.post(`/admin/orders/${id}/tracking`, payload).then((r) => r.data),
    updateLocation: (id, payload) => api.post(`/admin/orders/${id}/location`, payload).then((r) => r.data),
    markCodPaid: (id) => api.patch(`/admin/orders/${id}/mark-cod-paid`).then((r) => r.data),
  },

  sliders: {
    list: () => api.get('/admin/sliders').then((r) => r.data),
    create: (formData) =>
      api.post('/admin/sliders', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
    update: (id, formData) =>
      api
        .post(`/admin/sliders/${id}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data),
    toggleStatus: (id) => api.patch(`/admin/sliders/${id}/toggle-status`).then((r) => r.data),
    remove: (id) => api.delete(`/admin/sliders/${id}`).then((r) => r.data),
  },

  storeSettings: {
    get: () => api.get('/admin/settings/store').then((r) => r.data),
    update: (payload) => api.put('/admin/settings/store', payload).then((r) => r.data),
    saveRazorpayKeys: (payload) => api.put('/admin/settings/razorpay', payload).then((r) => r.data),
  },

  payments: {
    list: (params) => api.get('/admin/payments', { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/payments/${id}`).then((r) => r.data),
  },

  transactions: {
    list: (params) => api.get('/admin/transactions', { params }).then((r) => r.data),
  },

  referralSettings: {
    get: () => api.get('/admin/settings/referral').then((r) => r.data),
    update: (payload) => api.put('/admin/settings/referral', payload).then((r) => r.data),
  },
}
