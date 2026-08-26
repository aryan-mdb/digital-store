import api from './api'

export const authService = {
  register: (payload) => api.post('/register', payload).then((r) => r.data),
  login: (payload) => api.post('/login', payload).then((r) => r.data),
  logout: () => api.post('/logout').then((r) => r.data),
  me: () => api.get('/me').then((r) => r.data),
  updateProfile: (payload) => api.put('/profile', payload).then((r) => r.data),
  changePassword: (payload) => api.put('/change-password', payload).then((r) => r.data),
}
