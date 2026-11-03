import { useState } from 'react'
import { quoteCart } from '../services/api/contact.js'

export default function useCart({ apiOnline, showNotice }) {
  const [cartCount, setCartCount] = useState(0)
  const addToCart = async (product) => {
    setCartCount((count) => count + 1)
    showNotice(`${product.name} به سبد خرید اضافه شد`)

    if (apiOnline) {
      quoteCart([{ product_id: product.id, quantity: 1 }]).catch(() => {
        showNotice('محصول اضافه شد؛ محاسبه آنلاین سبد موقتاً در دسترس نیست')
      })
    }
  }
  return { cartCount, addToCart }
}
