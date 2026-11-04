import api from './api'

export const careerService = {
  /** @param {FormData} form — includes the CV file */
  apply: (form) => api.post('/careers/applications', form).then((r) => r.data),

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
