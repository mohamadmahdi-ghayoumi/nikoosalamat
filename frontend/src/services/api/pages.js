import { request } from './client.js'

export const getContentPage = (slug) => request(`/api/pages/${slug}`)
