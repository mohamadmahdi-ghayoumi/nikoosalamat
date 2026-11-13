import generatedFields from './copyFields.json'
import { socialUrls } from '../../config/socials.js'
import { solutionTopics } from '../../config/solutions.js'
import { heroSlides } from '../home/data/heroSlides.js'
import { categoryImages } from '../home/data/categoryImages.js'
import { fallbackBenefits } from '../home/data/homeContent.js'
import { pharmucareContent } from '../about/data/pharmucareContent.js'
import { aboutValues } from '../about/data/aboutValues.js'

const field = (field, group, label, value) => ({ field, group, label, value })
export const textFields = [
  ...generatedFields,
  ...solutionTopics.map((item) => field(`solution.topic.${item.id}`, 'راهکارها', item.label, item.label)),
  ...Object.entries({
    'home.about.action': 'ادامه مطلب درباره فارمیوکِر',
    'home.featured.action': 'دیدن همه محصولات',
    'home.newsletter.action': 'عضویت در باشگاه',
    'home.categories.action': 'همه دسته‌بندی‌ها',
  }).map(([key, value]) => field(key, 'دکمه‌های صفحه اصلی', value, value)),
  ...heroSlides.map((slide, index) =>
    field(
      `home.hero.${index}.action`,
      'اسلایدهای فعلی',
      `متن دکمه اسلاید ${index + 1}`,
      slide.action,
    ),
  ),
  ...heroSlides.flatMap((slide, index) =>
    ['title', 'text'].map((key) =>
      field(
        `home.hero.${index}.${key}`,
        'اسلایدهای فعلی',
        `${index + 1} — ${key === 'title' ? 'عنوان' : 'توضیح'}`,
        slide[key],
      ),
    ),
  ),
  ...fallbackBenefits.flatMap((item, index) =>
    ['title', 'description'].map((key) =>
      field(
        `home.benefits.${index}.${key}`,
        'مزیت‌های صفحه اصلی',
        `${index + 1} — ${key === 'title' ? 'عنوان' : 'توضیح'}`,
        item[key],
      ),
    ),
  ),
  ...Object.entries({
    'categories.eyebrow': 'از علم تا مزرعه، با حال نیکو سلامت',
    'categories.title': 'محصولات تخصصی در حوزه‌های مختلف',
    'featured.eyebrow': 'انتخاب تخصصی دامداران',
    'featured.title': 'محصولات',
    'featured.highlight': 'پیشنهادی',
    'about.eyebrow': pharmucareContent.tagline,
    'about.title': pharmucareContent.title,
    'about.description': pharmucareContent.introduction.slice(0, 2).join(' '),
    'newsletter.eyebrow': 'باشگاه نیکو سلامت',
    'newsletter.title': 'نکته‌های مراقبتی و خبرهای تازه',
    'newsletter.description': 'ماهی دو بار؛ کوتاه، کاربردی و بدون پیام‌های اضافه.',
    'brand.tagline': 'Green Care, Sustainable Health',
  }).map(([key, value]) => field(`home.${key}`, 'صفحه اصلی', value.slice(0, 60), value)),
  ...['Green Chemistry', 'Non-Antibiotic', 'Eco-Friendly', 'Safe and Non-Toxic'].map(
    (value, index) => field(`home.brand.trait.${index}`, 'ویژگی‌های فارمیوکر', value, value),
  ),
  ...aboutValues.flatMap((item) =>
    ['title', 'text'].map((key) =>
      field(
        `about.field.${item.id}.${key}`,
        'حوزه‌های فعالیت',
        `${item.title} — ${key === 'title' ? 'عنوان' : 'توضیح'}`,
        item[key],
      ),
    ),
  ),
  ...['title', 'tagline', 'principlesTitle'].map((key) =>
    field(
      `about.pharmucare.${key}`,
      'معرفی فارمیوکر',
      pharmucareContent[key],
      pharmucareContent[key],
    ),
  ),
  ...pharmucareContent.introduction.map((value, index) =>
    field(`about.pharmucare.intro.${index}`, 'معرفی فارمیوکر', `پاراگراف ${index + 1}`, value),
  ),
  ...pharmucareContent.principles.flatMap((item, index) =>
    ['title', 'text'].map((key) =>
      field(
        `about.pharmucare.principle.${index}.${key}`,
        'اصول فارمیوکر',
        `${index + 1} — ${key === 'title' ? 'عنوان' : 'توضیح'}`,
        item[key],
      ),
    ),
  ),
]
export const imageFields = [
  { field: 'brand.logo', group: 'سربرگ و برند', label: 'لوگوی سایت', url: '/images/hns-logo.png' },
  {
    field: 'header.cover',
    group: 'سربرگ و برند',
    label: 'تصویر بالای منو',
    url: '/images/nikoosalamat-about.jpg',
  },
  {
    field: 'brand.pharmucare',
    group: 'سربرگ و برند',
    label: 'لوگوی فارمیوکر',
    url: '/images/pharmucare-logo.png',
  },
  {
    field: 'magazine.logo',
    group: 'مجله',
    label: 'لوگوی نیکومگ',
    url: '/images/niko-mag-logo.png',
  },
  {
    field: 'about.photo',
    group: 'درباره ما',
    label: 'تصویر معرفی شرکت',
    url: '/images/nikoosalamat-about.jpg',
  },
  ...aboutValues.map((item) => ({
    field: `about.field.${item.id}`,
    group: 'درباره ما',
    label: item.title,
    url: item.image,
  })),
  ...solutionTopics.map((item) => ({
    field: `solution.icon.${item.id}`,
    group: 'آیکون‌های راهکارها',
    label: item.label,
    url: item.image,
  })),
  ...categoryImages.map((item, index) => ({
    field: `category.${index}`,
    group: 'کارت‌های صفحه اصلی',
    label: item.alt.split('؛')[0],
    url: item.image,
  })),
  ...heroSlides.map((item, index) => ({
    field: `hero.${index}`,
    group: 'اسلایدهای فعلی',
    label: `اسلاید ${index + 1}`,
    url: item.image,
  })),
  ...['about', 'contact', 'articles', 'products', 'solutions'].map((key) => ({
    field: `page.${key}.cover`,
    group: 'پس‌زمینه عنوان صفحات',
    label: {
      about: 'درباره ما',
      contact: 'ارتباط با ما',
      articles: 'مجله',
      products: 'محصولات',
      solutions: 'راهکارها',
    }[key],
    url: '',
  })),
  {
    field: 'story.poster',
    group: 'صفحه اصلی',
    label: 'پوستر ویدیوی معرفی',
    url: '/images/slides/hns-introduction-panoramic.webp',
  },
]
export const sectionCatalog = {
  home: [
    ['hero', 'اسلایدر'],
    ['benefits', 'مزیت‌ها'],
    ['categories', 'دسته‌بندی‌ها'],
    ['products', 'محصولات پیشنهادی'],
    ['about', 'معرفی فارمیوکر'],
    ['story', 'ویدیو'],
    ['newsletter', 'باشگاه'],
  ],
  about: [
    ['hero', 'عنوان صفحه'],
    ['company', 'معرفی شرکت'],
    ['pharmucare', 'فارمیوکر'],
    ['fields', 'حوزه‌های فعالیت'],
    ['certificates', 'گواهینامه‌ها'],
    ['stats', 'آمار'],
  ],
  contact: [
    ['hero', 'عنوان صفحه'],
    ['contact', 'اطلاعات و فرم تماس'],
    ['faq', 'سؤالات متداول'],
  ],
}
export const footerMenuDefaults = {
  solutions: [
    { label: 'مراقبت از سُم', path: '/pages/hoof-care' },
    { label: 'سلامت پستان', path: '/pages/udder-health' },
    { label: 'ضدعفونی دامداری', path: '/pages/farm-disinfection' },
    { label: 'بهداشت دام و اسب', path: '/pages/animal-hygiene' },
  ],
  guide: [
    { label: 'درباره نیکو سلامت', path: '/about' },
    { label: 'مجله نیکو سلامت', path: '/mag/' },
    { label: 'پرسش‌های متداول', path: '/contact#faq' },
    { label: 'ثبت و پیگیری سفارش', path: '/contact' },
  ],
}
export const themeDefaults = {
  primary: '#23763c',
  primaryDark: '#185b2e',
  background: '#f7faf7',
  paper: '#ffffff',
  text: '#3d3f44',
  muted: '#6b7076',
  line: '#dce6de',
  header: '#e9f5ec',
  footer: '#e9f5ec',
  navigationText: '#3d3f44',
  font: 'digikala',
  heading: { desktop: 37, tablet: 22, mobile: 18 },
  body: { desktop: 14, tablet: 13, mobile: 12 },
  cards: { desktop: 18, tablet: 16, mobile: 13 },
  navigation: { desktop: 14, tablet: 13, mobile: 13 },
  radius: 8,
  contentWidth: 1240,
}
export const linkFields = [
  ['contact.phone', 'لینک شماره تماس', 'tel:+989124283834'],
  ['contact.email', 'لینک ایمیل', 'mailto:info@nikoosalamat.ir'],
  ['contact.telegram', 'تلگرام تماس', socialUrls.telegram],
  ['social.instagram', 'اینستاگرام', socialUrls.instagram],
  ['social.telegram', 'تلگرام نوار کناری', socialUrls.telegram],
  ['social.bale', 'بله', socialUrls.bale],
  ['story.video', 'نشانی فایل ویدیوی معرفی', '/videos/hns-site-cover.mp4'],
]
