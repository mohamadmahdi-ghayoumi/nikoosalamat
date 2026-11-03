import { useState } from 'react'

export default function useProductFilters(products) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('همه محصولات')
  const categories = ['همه محصولات', ...new Set(products.map((product) => product.category))]
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'همه محصولات' || product.category === activeCategory
    const matchesQuery = product.name.includes(query) || product.category.includes(query)
    return matchesCategory && matchesQuery
  })
  return { query, setQuery, activeCategory, setActiveCategory, categories, visibleProducts }
}
