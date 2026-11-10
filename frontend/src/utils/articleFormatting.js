export const articleFonts = [
  ['Digikala', 'فونت سایت'], ['Tahoma', 'Tahoma'], ['Arial', 'Arial'], ['Georgia', 'Georgia'],
]
export const articleFontSizes = [12, 14, 16, 18, 20, 24, 28, 32]

export function safeImageSource(value = '') {
  const source = String(value).trim()
  if (/^\/(?:uploads|images)\/[\w./%+() -]+$/i.test(source) && !source.includes('..')) return source
  try {
    const url = new URL(source)
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href
  } catch { /* Invalid and executable URLs are not allowed. */ }
  return ''
}

export function imageWidth(value = '') {
  const match = String(value).trim().match(/^(\d{1,4})(%|px)?$/)
  if (!match) return '100%'
  const amount = Number(match[1])
  return match[2] === '%' ? `${Math.min(100, Math.max(20, amount))}%` : `${Math.min(1200, Math.max(80, amount))}px`
}

export function imageAlignment(value) {
  return ['right', 'center', 'left'].includes(value) ? value : 'center'
}

export function imageStyle(width, alignment) {
  const align = imageAlignment(alignment)
  return `width: ${imageWidth(width)}; height: auto; margin-left: ${align === 'left' ? '0' : 'auto'}; margin-right: ${align === 'right' ? '0' : 'auto'};`
}

// Only these formatting properties survive a paste or a saved article.
export function cleanTextStyle(element) {
  const style = element.style
  const safe = []
  const family = style.fontFamily.replace(/["']/g, '').trim()
  const font = articleFonts.find(([name]) => name.toLowerCase() === family.toLowerCase())
  if (font) safe.push(`font-family: ${font[0]}`)
  const size = style.fontSize.match(/^(\d+)px$/)
  if (size && articleFontSizes.includes(Number(size[1]))) safe.push(`font-size: ${size[1]}px`)
  if (['P', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName) && ['right', 'center', 'left', 'justify'].includes(style.textAlign)) safe.push(`text-align: ${style.textAlign}`)
  return safe.join('; ')
}
