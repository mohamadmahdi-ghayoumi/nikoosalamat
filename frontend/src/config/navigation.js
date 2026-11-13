import { solutionItems, solutionTopics } from './solutions.js'

export const navigationItems = [
  { label: 'خانه', path: '/' },
  {
    label: 'محصولات',
    path: '/products',
    children: [
      {
        label: 'دام',
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
      { label: 'انسانی', path: '/about#human' },
    ],
  },
  {
    label: 'مجله نیکو سلامت',
    path: '/mag/',
    activePaths: ['/mag', '/articles'],
  },
  {
    label: 'راهکارها',
    path: '/solutions',
    activePaths: [
      ...solutionItems.map((item) => item.path),
      '/pages/farm-disinfection',
      '/pages/animal-hygiene',
    ],
    children: solutionTopics.map(({ label, path }) => ({ label, path })),
  },
  {
    label: 'درباره ما',
    path: '/about',
    children: [
      { label: 'حال نیکو سلامت', path: '/about#company' },
      { label: 'فارمیوکِر', path: '/about#pharmucare' },
      { label: 'حوزه های فعالیت', path: '/about#fields' },
      { label: 'گواهینامه ها و افتخارات', path: '/about#certificates' },
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
