// Only the left 64% of the supplied 2400 × 960 artwork is displayed. Printed
// text stays outside the SVG viewport; HeroSlider renders real text and links.
const scene = { viewBox: '0 0 1536 960', width: 2400, height: 960 }

export const heroSlides = [
  {
    image: '/images/slides/hns-introduction.webp',
    scene,
    eyebrow: 'از علم تا مزرعه',
    title: 'حال نیکو سلامت',
    text: 'از علم تا مزرعه، با حالِ نیک',
    action: 'مشاهده محصولات',
    path: '/products',
    alt: 'دامپزشک در کنار گاو، اسب، گوسفند و بز در مزرعه',
  },
  {
    image: '/images/slides/viroguardia.webp',
    scene,
    eyebrow: 'مراقبت از سلامت دام',
    title: 'محلول ویروگاردیا',
    text: 'تب برفکی منتظر نمی‌ماند؛ شما هم منتظر نمانید!',
    action: 'مشاهده محصول',
    path: '/products/3',
    alt: 'دامپزشک در حال معاینه دهان گاو در دامداری',
  },
  {
    image: '/images/slides/farm-disinfection.webp',
    scene,
    eyebrow: 'بهداشت دامداری',
    title: 'ضدعفونی‌کننده فارمیکو',
    text: 'گاهی باید فراتر از تمیزی نگاه کرد…',
    action: 'مشاهده محصول',
    path: '/products/5',
    alt: 'ضدعفونی جایگاه دام با تجهیزات حفاظت فردی',
  },
  {
    image: '/images/slides/hoof-gel.webp',
    scene,
    eyebrow: 'مراقبت از سُم',
    title: 'هوف ژل فارمیکو',
    text: 'گاهی باید از نزدیک به سُم نگاه کرد!',
    action: 'مشاهده محصول',
    path: '/products/1',
    alt: 'هوف ژل فارمیکو در کنار گاو و نمای سُم در دامداری',
  },
  {
    image: '/images/slides/udder-balm.webp',
    scene,
    eyebrow: 'سلامت پستان',
    title: 'پماد پستان فارمیکو',
    text: 'گاهی یک زخم کوچک، توجه می‌خواهد…',
    action: 'مشاهده محصول',
    path: '/products/2',
    alt: 'پماد پستان فارمیکو در کنار گاو شیری در دامداری',
  },
]
