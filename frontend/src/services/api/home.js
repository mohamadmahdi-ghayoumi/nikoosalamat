import { request } from './client.js'

export const getHomeData = () => request('/api/home')
