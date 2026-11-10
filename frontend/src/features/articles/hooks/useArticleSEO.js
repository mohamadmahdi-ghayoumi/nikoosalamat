import { useEffect } from 'react'
import { articlePlainText } from '../../../utils/articleContent.js'
import { resolveMediaUrl } from '../../../services/api/client.js'

export default function useArticleSEO(article) {
  useEffect(() => {
    if (!article) return
    const cleanups = []
    const previousTitle = document.title
    const title = `${article.title} | مجله حال نیکو سلامت`
    const description = articlePlainText(article.excerpt || '').trim()
    const url = new URL(`/articles/${encodeURIComponent(article.slug)}`, window.location.origin).href
    const update = (selector, tag, attributes) => {
      let element = document.head.querySelector(selector)
      const existed = Boolean(element)
      if (!element) { element = document.createElement(tag); document.head.append(element) }
      const previous = Object.fromEntries(Object.keys(attributes).map((key) => [key, element.getAttribute(key)]))
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
      cleanups.push(() => {
        if (!existed) { element.remove(); return }
        for (const [key, value] of Object.entries(previous)) {
          if (value === null) element.removeAttribute(key)
          else element.setAttribute(key, value)
        }
      })
    }
    document.title = title
    update('meta[name="description"]', 'meta', { name: 'description', content: description })
    update('link[rel="canonical"]', 'link', { rel: 'canonical', href: url })
    for (const [property, content] of Object.entries({ 'og:title': title, 'og:description': description, 'og:type': 'article', 'og:url': url })) {
      update(`meta[property="${property}"]`, 'meta', { property, content })
    }
    const schema = document.createElement('script')
    schema.type = 'application/ld+json'
    const dates = {}
    for (const [key, value] of [['datePublished', article.created_at], ['dateModified', article.updated_at]]) {
      if (!value) continue
      const date = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : value.replace(' ', 'T') + 'Z')
      if (!Number.isNaN(date.getTime())) dates[key] = date.toISOString()
    }
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Article', headline: article.title,
      description, mainEntityOfPage: url,
      ...dates,
      ...(article.image_url ? { image: new URL(resolveMediaUrl(article.image_url), window.location.origin).href } : {}),
    }).replace(/</g, '\\u003c')
    document.head.append(schema)
    return () => {
      document.title = previousTitle
      cleanups.reverse().forEach((cleanup) => cleanup())
      schema.remove()
    }
  }, [article])
}
