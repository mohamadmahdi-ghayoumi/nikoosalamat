import { useState } from 'react'

const categories = [
  'همه محصولات',
  'مراقبت از سم',
  'سلامت پستان',
  'ضدعفونی کننده ها',
  'مقابله با مگس',
  'بهداشت و سلامت اسب',
  'کودهای سبز',
]

const normalize = (value) =>
  value
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\s\u200c]+/g, '')

const categoryAliases = new Map(
  [
    ['ضدعفونی دامداری', 'ضدعفونی کننده ها'],
    ['بهداشت دامداری', 'ضدعفونی کننده ها'],
    ['کنترل مگس', 'مقابله با مگس'],
    ['بهداشت اسب', 'بهداشت و سلامت اسب'],
  ].map(([source, target]) => [normalize(source), target]),
)

export default function useProductFilters(products) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get('category')
    return categories.includes(requestedCategory) ? requestedCategory : 'همه محصولات'
  })
  const visibleProducts = products.filter((product) => {
    const category = categoryAliases.get(normalize(product.category)) || product.category
    const matchesCategory =
      activeCategory === 'همه محصولات' || normalize(category) === normalize(activeCategory)
    const matchesQuery = normalize(`${product.name} ${product.category} ${category}`).includes(
      normalize(query),
    )
    return matchesCategory && matchesQuery
  })
  return { query, setQuery, activeCategory, setActiveCategory, categories, visibleProducts }
}
