export const solutionTopics = [
  { id: 'hoof-care', label: 'مراقبت از سُم', path: '/pages/hoof-care' },
  { id: 'udder-health', label: 'سلامت پستان', path: '/pages/udder-health' },
  { id: 'disinfection', label: 'ضدعفونی‌کننده‌ها', path: '/pages/farm-disinfection' },
  { id: 'fly-control', label: 'مقابله با مگس', path: `/products?category=${encodeURIComponent('مقابله با مگس')}` },
  { id: 'horse-care', label: 'پرورش اسب', path: '/pages/animal-hygiene' },
  { id: 'green-fertilizers', label: 'کودهای سبز', path: `/products?category=${encodeURIComponent('کودهای سبز')}` },
  { id: 'foot-and-mouth', label: 'تب برفکی', path: '/pages/foot-and-mouth' },
].map((item) => ({ ...item, image: `/images/solutions/${item.id}.png` }))

export const solutionItems = [
  {
    label: 'تب برفکی',
    path: '/pages/foot-and-mouth',
    icon: 'shield',
    description: 'آشنایی با راهکارهای مراقبت دهانی دام و دریافت اطلاعات تکمیلی.',
  },
  {
    label: 'درماتیت انگشتی',
    path: '/pages/digital-dermatitis',
    icon: 'hoof',
    description: 'اطلاعات مرتبط با مراقبت از پوست ناحیه انگشتان و سُم دام.',
  },
  {
    label: 'سلامت پستان',
    path: '/pages/udder-health',
    icon: 'heart',
    description: 'معرفی راهکارهای مراقبت روزانه از پوست خارجی پستان.',
  },
  {
    label: 'مراقبت از سُم',
    path: '/pages/hoof-care',
    icon: 'hoof',
    description: 'آشنایی با دسته محصولات و مطالب مرتبط با مراقبت از سُم.',
  },
  {
    label: 'زخم‌ها و آسیب‌ها',
    path: '/pages/wounds-injuries',
    icon: 'badge-check',
    description: 'دریافت اطلاعات محصولات و مشاوره برای انتخاب متناسب با نیاز دامداری.',
  },
]
