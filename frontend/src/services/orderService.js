import api from './api'

export const orderService = {
  list: (params) => api.get('/orders', { params }).then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (productId, useWallet = false) =>
    api.post('/orders', { product_id: productId, use_wallet: useWallet }).then((r) => r.data),
}

export const paymentService = {
  create: (orderId) => api.post(`/payments/crypto/${orderId}`).then((r) => r.data),
  get: (paymentId) => api.get(`/payments/crypto/${paymentId}`).then((r) => r.data),
}

export const downloadService = {
  /**
   * Downloads are authenticated (Bearer token), so a plain <a href> can't
   * be used — fetch the file as a blob through the axios instance (which
   * attaches the token) and save it client-side.
   */
  async download(orderItemId, suggestedName = 'download') {
    const response = await api.get(`/downloads/${orderItemId}`, { responseType: 'blob' })
    const blobUrl = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = suggestedName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  },
}
