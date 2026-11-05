import { solutionItems } from './solutions.js'

export const navigationItems = [
  { label: 'خانه', path: '/' },
  {
    label: 'محصولات',
    path: '/products',
    children: [
      {
        label: 'دام سنگین',
        path: '/products',
        children: [
          { label: 'هوف ژل فارمیوکِر', path: '/products/1' },
          { label: 'پماد پستان فارمیوکِر', path: '/products/2' },
          { label: 'محلول ویروگاردیا', path: '/products/3' },
          { label: 'اسپری سم فارمیوکِر', path: '/products/4' },
          { label: 'پاک‌کننده سم فارمیوکِر', path: '/products/6' },
        ],
      },
      { label: 'اسب', path: '/about#horses' },
      { label: 'کشاورزی', path: '/about#agriculture' },
    ],
  },
  {
    label: 'مقالات',
    path: '/articles',
  },
  {
    label: 'راهکارها',
    path: '/solutions',
    activePaths: [
      ...solutionItems.map((item) => item.path),
      '/pages/farm-disinfection',
      '/pages/animal-hygiene',
    ],
    children: solutionItems,
  },
  {
    label: 'درباره ما',
    path: '/about',
    children: [
      { label: 'معرفی شرکت', path: '/about#company' },
      { label: 'حوزه‌های فعالیت', path: '/about#fields' },
      { label: 'همکاری با فارمیوکِر', path: '/about#pharmucare' },
    ],
  },
  {
    label: 'ارتباط با ما',
    path: '/contact',
    children: [
      { label: 'تماس با ما', path: '/contact#contact-form' },
      { label: 'سؤالات متداول', path: '/contact#faq' },
      { label: 'همکاری در فروش', path: '/contact#sales' },
    ],
  },
]
