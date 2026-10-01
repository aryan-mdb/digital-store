import api from './api'

export const siteService = {
  settings: () => api.get('/site-settings').then((r) => r.data),
  sliders: () => api.get('/sliders').then((r) => r.data),
  trackOrder: (orderNumber, phone) =>
    api.post('/track-order', { order_number: orderNumber, phone }).then((r) => r.data),
}
