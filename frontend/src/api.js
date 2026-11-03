const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:8011')

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      const message = payload?.detail || 'خطایی در ارتباط با سرور رخ داد'
      throw new Error(message)
    }
    return payload
  } finally {
    window.clearTimeout(timeout)
  }
}

export const getHomeData = () => request('/api/home')

export const getProducts = () => request('/api/products')
export const getProduct = (id) => request(`/api/products/${id}`)

export const updateProductCatalog = (token, id, catalog) => request(`/api/admin/products/${id}/catalog`, {
  method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(catalog),
})

export const getContentPage = (slug) => request(`/api/pages/${slug}`)

export const getArticles = () => request('/api/articles')

export const getArticle = (slug) => request(`/api/articles/${slug}`)

export const subscribeNewsletter = (mobile) => request('/api/newsletter', {
  method: 'POST',
  body: JSON.stringify({ mobile }),
})

export const quoteCart = (items) => request('/api/cart/quote', {
  method: 'POST',
  body: JSON.stringify({ items }),
})

export const sendContactMessage = (contact) => request('/api/contact', {
  method: 'POST',
  body: JSON.stringify(contact),
})

const adminHeaders = (token) => ({ Authorization: `Bearer ${token}` })

export const adminLogin = (credentials) => request('/api/admin/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
})

export const getAdminProfile = (token) => request('/api/admin/me', {
  headers: adminHeaders(token),
})

export const adminLogout = (token) => request('/api/admin/logout', {
  method: 'POST',
  headers: adminHeaders(token),
})

export const createAdminProduct = (token, product) => request('/api/admin/products', {
  method: 'POST',
  headers: adminHeaders(token),
  body: JSON.stringify(product),
})

export const deleteAdminProduct = (token, productId) => request(`/api/admin/products/${productId}`, {
  method: 'DELETE',
  headers: adminHeaders(token),
})

export const getAdminPages = (token) => request('/api/admin/pages', {
  headers: adminHeaders(token),
})

export const updateAdminPage = (token, pageId, page) => request(`/api/admin/pages/${pageId}`, {
  method: 'PUT',
  headers: adminHeaders(token),
  body: JSON.stringify(page),
})

export const getAdminArticles = (token) => request('/api/admin/articles', {
  headers: adminHeaders(token),
})

export const createAdminArticle = (token, article) => request('/api/admin/articles', {
  method: 'POST',
  headers: adminHeaders(token),
  body: JSON.stringify(article),
})

export const updateAdminArticle = (token, articleId, article) => request(`/api/admin/articles/${articleId}`, {
  method: 'PUT',
  headers: adminHeaders(token),
  body: JSON.stringify(article),
})

export const deleteAdminArticle = (token, articleId) => request(`/api/admin/articles/${articleId}`, {
  method: 'DELETE',
  headers: adminHeaders(token),
})

export const resolveMediaUrl = (path) => path?.startsWith('/') ? `${API_BASE_URL}${path}` : path
