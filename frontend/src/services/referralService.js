import api from './api'

export const referralService = {
  get: (params) => api.get('/referrals', { params }).then((r) => r.data),
}
