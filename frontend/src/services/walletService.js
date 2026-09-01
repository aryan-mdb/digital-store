import api from './api'

export const walletService = {
  get: () => api.get('/wallet').then((r) => r.data),
  transactions: (params) => api.get('/wallet/transactions', { params }).then((r) => r.data),
}
