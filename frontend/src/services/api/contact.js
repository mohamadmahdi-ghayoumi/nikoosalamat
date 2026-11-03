import { request } from './client.js'

export const subscribeNewsletter = (mobile) =>
  request('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify({ mobile }),
  })

export const quoteCart = (items) =>
  request('/api/cart/quote', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })

export const sendContactMessage = (contact) =>
  request('/api/contact', {
    method: 'POST',
    body: JSON.stringify(contact),
  })
