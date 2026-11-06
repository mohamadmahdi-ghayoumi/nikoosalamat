import { useEffect } from 'react'
import { ADMIN_PATH } from '../app/adminRoute.js'

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
      titles[currentPath] ||
      (currentPath.startsWith('/products/')
        ? 'کاتالوگ محصول | نیکو سلامت'
        : currentPath.startsWith('/articles/')
          ? 'مقاله | نیکو سلامت'
          : currentPath.startsWith('/pages/')
            ? 'راهکارهای نیکو سلامت'
            : titles['/'])
  }, [currentPath])
}
