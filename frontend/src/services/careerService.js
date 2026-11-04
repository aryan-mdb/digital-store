import api from './api'

export const careerService = {
  /** Active roles for the Careers page. */
  openings: () => api.get('/careers/openings').then((r) => r.data),
  /** @param {FormData} form — includes the CV file */
  apply: (form) => api.post('/careers/applications', form).then((r) => r.data),

  openingsAdmin: {
    list: () => api.get('/admin/job-openings').then((r) => r.data),
    create: (payload) => api.post('/admin/job-openings', payload).then((r) => r.data),
    update: (id, payload) => api.put(`/admin/job-openings/${id}`, payload).then((r) => r.data),
    toggle: (id) => api.patch(`/admin/job-openings/${id}/toggle-status`).then((r) => r.data),
    remove: (id) => api.delete(`/admin/job-openings/${id}`).then((r) => r.data),
  },

  admin: {
    list: (params) => api.get('/admin/career-applications', { params }).then((r) => r.data),
    setStatus: (id, status) => api.patch(`/admin/career-applications/${id}`, { status }).then((r) => r.data),
    remove: (id) => api.delete(`/admin/career-applications/${id}`).then((r) => r.data),
    async downloadCv(application) {
      const response = await api.get(`/admin/career-applications/${application.id}/cv`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = application.cv_name || 'cv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  },
}
