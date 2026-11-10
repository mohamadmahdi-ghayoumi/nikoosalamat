import { request } from './client.js'

const adminHeaders = (token) => ({ Authorization: `Bearer ${token}` })

export const adminLogin = (credentials) =>
  request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

export const getAdminProfile = (token) =>
  request('/api/admin/me', {
    headers: adminHeaders(token),
  })

export const adminLogout = (token) =>
  request('/api/admin/logout', {
    method: 'POST',
    headers: adminHeaders(token),
  })

export const createAdminProduct = (token, product) =>
  request('/api/admin/products', {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(product),
  })

export const updateAdminProduct = (token, productId, product) =>
  request(`/api/admin/products/${productId}`, {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(product),
  })

export const deleteAdminProduct = (token, productId) =>
  request(`/api/admin/products/${productId}`, {
    method: 'DELETE',
    headers: adminHeaders(token),
  })

export const updateProductCatalog = (token, id, catalog) =>
  request(`/api/admin/products/${id}/catalog`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(catalog),
  })

export const getAdminPages = (token) =>
  request('/api/admin/pages', {
    headers: adminHeaders(token),
  })

export const updateAdminPage = (token, pageId, page) =>
  request(`/api/admin/pages/${pageId}`, {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(page),
  })

export const getAdminArticles = (token) =>
  request('/api/admin/articles', {
    headers: adminHeaders(token),
  })

export const createAdminArticle = (token, article) =>
  request('/api/admin/articles', {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(article),
  })

export const updateAdminArticle = (token, articleId, article) =>
  request(`/api/admin/articles/${articleId}`, {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(article),
  })

export const deleteAdminArticle = (token, articleId) =>
  request(`/api/admin/articles/${articleId}`, {
    method: 'DELETE',
    headers: adminHeaders(token),
  })
