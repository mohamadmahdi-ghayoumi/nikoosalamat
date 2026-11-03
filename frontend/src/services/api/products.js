import { request } from './client.js'

export const getProducts = () => request('/api/products')

export const getProduct = (id) => request(`/api/products/${id}`)
