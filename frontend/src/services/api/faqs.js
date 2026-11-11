import { request } from './client.js'

export const getFaqs = () => request('/api/faqs')
export const faqAdminRequest = (token, suffix = '', options = {}) =>
  request(`/api/admin/faqs${suffix}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}` },
  })
