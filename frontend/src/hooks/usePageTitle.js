import { useEffect } from 'react'
import { ADMIN_PATH } from '../app/adminRoute.js'
import { seoPages } from '../utils/seoPages.js'

const launchRobots = document.querySelector('meta[name="robots"]')?.content || 'noindex, nofollow'

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) { element = document.createElement('meta'); document.head.append(element) }
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value)
}

export default function usePageTitle(currentPath) {
  useEffect(() => {
    const titles = {
      '/': 'نیکو سلامت | محصولات تخصصی سلامت دام و اسب',
      '/products': 'محصولات | نیکو سلامت',
      '/articles': 'مقالات | نیکو سلامت',
      '/solutions': 'راهکارها | نیکو سلامت',
      '/search': 'نتایج جست‌وجو | نیکو سلامت',
      '/about': 'درباره ما | نیکو سلامت',
      '/contact': 'تماس با ما | نیکو سلامت',
      [ADMIN_PATH]: 'داشبورد مدیریت | نیکو سلامت',
    }
    document.title =
      seoPages[currentPath]?.[0] || titles[currentPath] ||
      (currentPath.startsWith('/products/')
        ? 'کاتالوگ محصول | نیکو سلامت'
        : currentPath.startsWith('/articles/')
          ? 'مقاله | نیکو سلامت'
          : currentPath.startsWith('/pages/')
            ? 'راهکارهای نیکو سلامت'
            : titles['/'])
    const description = seoPages[currentPath]?.[1] || 'اطلاعات و راهکارهای تخصصی حال نیکو سلامت برای دامپروری، پرورش اسب و کشاورزی.'
    setMeta('meta[name="description"]', { name: 'description', content: description })
    const isDynamic = /^\/(?:products\/\d+|articles\/[^/]+|pages\/[^/]+)$/.test(currentPath)
    const isPublic = Boolean(seoPages[currentPath]) || isDynamic
    for (const name of ['robots', 'googlebot']) setMeta(`meta[name="${name}"]`, { name, content: isPublic ? launchRobots : 'noindex, follow' })
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (isPublic) {
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
      canonical.href = new URL(currentPath, window.location.origin).href
    } else canonical?.remove()
    for (const [property, content] of Object.entries({ 'og:title': document.title, 'og:description': description, 'og:type': 'website', 'og:url': new URL(currentPath, window.location.origin).href, 'og:image': new URL('/images/hns-logo.png', window.location.origin).href, 'og:locale': 'fa_IR', 'og:site_name': 'حال نیکو سلامت' })) setMeta(`meta[property="${property}"]`, { property, content })
  }, [currentPath])
}
