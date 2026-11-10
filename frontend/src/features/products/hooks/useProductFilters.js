import { useState } from 'react'
import { productCategories, normalizeProductText as normalize, resolveProductCategory } from '../data/productCategories.js'

const categories = ['همه محصولات', ...productCategories]

export default function useProductFilters(products) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get('category')
    const category = resolveProductCategory(requestedCategory)
    return categories.includes(category) ? category : 'همه محصولات'
  })
  const visibleProducts = products.filter((product) => {
    const category = resolveProductCategory(product.category)
    const matchesCategory =
      activeCategory === 'همه محصولات' ||
      normalize(category) === normalize(activeCategory) ||
      (activeCategory === 'محلول تب برفکی' && normalize(product.name).includes('ویروگاردیا'))
    const matchesQuery = normalize(`${product.name} ${product.category} ${category}`).includes(
      normalize(query),
    )
    return matchesCategory && matchesQuery
  })
  return { query, setQuery, activeCategory, setActiveCategory, categories, visibleProducts }
}
