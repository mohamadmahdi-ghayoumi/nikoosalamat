import { request } from './client.js'

export const getArticles = () => request('/api/articles')

export const getArticle = (slug) => request(`/api/articles/${slug}`)
