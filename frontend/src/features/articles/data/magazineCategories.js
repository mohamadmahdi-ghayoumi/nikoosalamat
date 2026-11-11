export const magazineCategories = [
  { slug: 'latest', label: 'جدیدترین‌ها' },
  { slug: 'hoof-trimming', label: 'سم‌چینی' },
  { slug: 'diseases', label: 'بیماری‌ها' },
  { slug: 'scientific', label: 'مقالات علمی' },
  { slug: 'sheep-goats', label: 'گوسفند و بز' },
  { slug: 'agriculture', label: 'کشاورزی' },
  { slug: 'horses', label: 'اسب' },
  { slug: 'human', label: 'انسانی' },
]

export const magazineCategoryLabel = (slug) =>
  magazineCategories.find((item) => item.slug === slug)?.label || 'عمومی'
export const magazineCategoryUrl = (slug) =>
  slug === 'latest' || slug === 'general' ? '/mag/' : `/mag/?category=${encodeURIComponent(slug)}`
