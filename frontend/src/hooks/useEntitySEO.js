import { useEffect } from 'react'
import { articlePlainText } from '../utils/articleContent.js'
import { resolveMediaUrl } from '../services/api/client.js'

// Detail pages replace the generic route description once their data arrives.
export default function useEntitySEO(record, kind) {
  useEffect(() => {
    if (!record) return
    const product = kind === 'product'
    const name = product ? record.name : record.title
    const parent = product ? '/products' : '/solutions'
    const parentName = product ? 'محصولات' : 'راهکارها'
    const path = product ? `/products/${record.id}` : `/pages/${encodeURIComponent(record.slug)}`
    const url = new URL(path, location.origin).href
    const description = articlePlainText((product ? record.catalog?.summary || record.catalog?.description : record.summary) || `آشنایی با ${name} و اطلاعات کاربرد آن در حال نیکو سلامت.`).slice(0, 500)
    const previousTitle = document.title
    const title = `${name} | حال نیکو سلامت`
    const cleanups = []
    const set = (selector, tag, attrs) => {
      let element = document.head.querySelector(selector)
      const existed = Boolean(element)
      if (!element) { element = document.createElement(tag); document.head.append(element) }
      const previous = Object.fromEntries(Object.keys(attrs).map((key) => [key, element.getAttribute(key)]))
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
      cleanups.push(() => {
        if (!existed) { element.remove(); return }
        Object.entries(previous).forEach(([key, value]) => value === null ? element.removeAttribute(key) : element.setAttribute(key, value))
      })
    }
    document.title = title
    set('meta[name="description"]', 'meta', { name: 'description', content: description })
    set('link[rel="canonical"]', 'link', { rel: 'canonical', href: url })
    for (const [property, content] of Object.entries({ 'og:title': title, 'og:description': description, 'og:url': url, 'og:type': 'website', ...(record.image_url ? { 'og:image': new URL(resolveMediaUrl(record.image_url), location.origin).href } : {}) })) set(`meta[property="${property}"]`, 'meta', { property, content })
    const schema = document.createElement('script')
    schema.type = 'application/ld+json'
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['خانه', '/'], [parentName, parent], [name, path]].map(([label, href], index) => ({ '@type': 'ListItem', position: index + 1, name: label, item: new URL(href, location.origin).href })) }).replace(/</g, '\\u003c')
    document.head.append(schema)
    return () => { document.title = previousTitle; cleanups.reverse().forEach((cleanup) => cleanup()); schema.remove() }
  }, [record, kind])
}
