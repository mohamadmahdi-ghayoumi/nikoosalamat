// Shared by the storefront filters and the admin product form.
export const productCategories = [
  'مراقبت از سم',
  'سلامت پستان',
  'ضدعفونی کننده ها',
  'مقابله با مگس',
  'بهداشت و سلامت اسب',
  'کودهای سبز',
  'محلول تب برفکی',
]

export const normalizeProductText = (value) => (value || '')
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/ي/g, 'ی')
  .replace(/ك/g, 'ک')
  .replace(/[\s\u200c]+/g, '')

const aliases = new Map([
  ['ضدعفونی دامداری', 'ضدعفونی کننده ها'],
  ['بهداشت دامداری', 'ضدعفونی کننده ها'],
  ['کنترل مگس', 'مقابله با مگس'],
  ['بهداشت اسب', 'بهداشت و سلامت اسب'],
  ['تب برفکی', 'محلول تب برفکی'],
].map(([source, target]) => [normalizeProductText(source), target]))

export const resolveProductCategory = (value) => aliases.get(normalizeProductText(value)) ||
  productCategories.find((category) => normalizeProductText(category) === normalizeProductText(value)) || value
