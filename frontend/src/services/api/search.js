import { request } from './client.js'

export const searchSite = (query) => request(`/api/search?q=${encodeURIComponent(query)}`)
