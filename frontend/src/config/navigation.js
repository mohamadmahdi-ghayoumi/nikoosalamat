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
          { label: 'هوف ژل فارمیکو', path: '/products' },
          { label: 'پماد پستان فارمیکو', path: '/products' },
          { label: 'محلول ویروگاردیا', path: '/products' },
          { label: 'اسپری سم فارمیکو', path: '/products' },
          { label: 'پاک‌کننده سم فارمیکو', path: '/products' },
        ],
      },
      { label: 'اسب', path: '/products' },
      { label: 'کشاورزی', path: '/products' },
    ],
  },
  {
    label: 'مقالات',
    path: '/articles',
    children: [
      { label: 'سلامت دام', path: '/articles' },
      { label: 'بیماری‌ها', path: '/articles' },
      { label: 'آموزش', path: '/articles' },
      { label: 'مقالات علمی', path: '/articles' },
      { label: 'اخبار', path: '/articles' },
    ],
  },
  {
    label: 'راهکارها',
    path: '/about',
    children: [
      { label: 'تب برفکی', path: '/about' },
      { label: 'درماتیت انگشتی', path: '/about' },
      { label: 'ورم پستان', path: '/about' },
      { label: 'مراقبت از سم', path: '/about' },
      { label: 'زخم‌ها و آسیب‌ها', path: '/about' },
    ],
  },
  {
    label: 'درباره ما',
    path: '/about',
    children: [
      { label: 'معرفی شرکت', path: '/about' },
      { label: 'تیم ما', path: '/about' },
      { label: 'گواهینامه‌ها و افتخارات', path: '/about' },
      { label: 'چرا فارمیکو', path: '/about' },
      { label: 'دانلود کاتالوگ', path: '/about' },
    ],
  },
  {
    label: 'ارتباط با ما',
    path: '/contact',
    children: [
      { label: 'تماس با ما', path: '/contact' },
      { label: 'سؤالات متداول', path: '/contact' },
      { label: 'نمایندگی فروش', path: '/contact' },
    ],
  },
]
