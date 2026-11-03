import api from './api'

export const orderService = {
  list: (params) => api.get('/orders', { params }).then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  /**
   * @param {{ productId: number, useWallet?: boolean, paymentMethod?: 'razorpay'|'cod'|'crypto', shipping?: object }} args
   */
  create: ({ productId, useWallet = false, paymentMethod = 'crypto', shipping }) =>
    api
      .post('/orders', { product_id: productId, use_wallet: useWallet, payment_method: paymentMethod, shipping })
      .then((r) => r.data),
}

export const paymentService = {
  create: (orderId) => api.post(`/payments/crypto/${orderId}`).then((r) => r.data),
  get: (paymentId) => api.get(`/payments/crypto/${paymentId}`).then((r) => r.data),
}

export const razorpayService = {
  create: (orderId) => api.post(`/payments/razorpay/${orderId}`).then((r) => r.data),
  verify: (orderId, payload) => api.post(`/payments/razorpay/${orderId}/verify`, payload).then((r) => r.data),
}

const EXTENSIONS = { 'application/pdf': 'pdf', 'application/zip': 'zip', 'image/png': 'png', 'image/jpeg': 'jpg' }

/**
 * Downloads are authenticated (Bearer token), so a plain <a href> can't
 * be used — fetch the file as a blob through the axios instance (which
 * attaches the token). With responseType 'blob' a JSON error body also
 * arrives as a Blob, so it is parsed back for apiErrorMessage().
 */
async function fetchFile(orderItemId, params) {
  try {
    const response = await api.get(`/downloads/${orderItemId}`, { params, responseType: 'blob' })
    return response.data
  } catch (error) {
    const body = error?.response?.data
    if (body instanceof Blob) {
      try {
        error.response.data = JSON.parse(await body.text())
      } catch {
        // not JSON — leave the generic message
      }
    }
    throw error
  }
}

export const downloadService = {
  async download(orderItemId, suggestedName = 'download') {
    const blob = await fetchFile(orderItemId)
    const ext = EXTENSIONS[blob.type]
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = ext && !suggestedName.includes('.') ? `${suggestedName}.${ext}` : suggestedName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  },

  /**
   * Opens the file in a new tab (the browser's PDF viewer for guides).
   * The tab is opened before the request so popup blockers allow it.
   */
  async view(orderItemId) {
    const tab = window.open('', '_blank')
    try {
      const blob = await fetchFile(orderItemId, { inline: 1 })
      const blobUrl = window.URL.createObjectURL(blob)
      if (tab) tab.location.href = blobUrl
      else window.location.href = blobUrl
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000)
    } catch (error) {
      tab?.close()
      throw error
    }
  },
}
