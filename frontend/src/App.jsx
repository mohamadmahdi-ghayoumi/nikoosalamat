import React, { useEffect, useRef, useState } from 'react'
import { adminLogin, adminLogout, createAdminArticle, createAdminProduct, deleteAdminArticle, deleteAdminProduct, getAdminArticles, getAdminPages, getAdminProfile, getArticle, getArticles, getContentPage, getHomeData, getProducts, quoteCart, resolveMediaUrl, sendContactMessage, subscribeNewsletter, updateAdminArticle, updateAdminPage } from './api.js'

const Icon = ({ name, size = 22 }) => {
  const paths = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    bag: <><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    chevron: <><path d="m8 10 4 4 4-4" /></>,
    leaf: <><path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z" /><path d="M4 21c2-5 6-9 12-12" /></>,
    shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>,
    heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></>,
    sparkle: <><path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3Z" /><path d="m19 15 .6 2.1L22 18l-2.4.9L19 21l-.6-2.1L16 18l2.4-.9L19 15Z" /></>,
    drop: <><path d="M12 3s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12Z" /></>,
    hoof: <><path d="M8 5c-2 2-3 5-3 8 0 5 3 8 7 8s7-3 7-8c0-3-1-6-3-8" /><path d="M8 5c1 3 2 4 4 4s3-1 4-4M9 14h.01M15 14h.01M12 17h.01" /></>,
    spray: <><path d="M9 7h8v3h-3v2M10 12h5v9H7v-6c0-2 1-3 3-3Z" /><path d="M11 7V4h5M18 6h3M18 3l2-1M18 9l2 1" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    telegram: <><path d="m21 3-4 18-6-5-4 3 1-6L3 10 21 3Z" /><path d="m8 13 9-6-6 9" /></>,
    bale: <><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3Z" /><path d="m7 11 3 3 7-7" /></>,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

// Add the official channel URLs here when provided. No destination is assumed.
const socialChannels = [
  { icon: 'instagram', label: 'اینستاگرام', href: null },
  { icon: 'telegram', label: 'تلگرام', href: null },
  { icon: 'bale', label: 'بله', href: null },
]

function SocialLinks({ placement }) {
  return (
    <div className={`social-links social-links-${placement}`} role="group" aria-label="شبکه‌های اجتماعی نیکو سلامت">
      {socialChannels.map(({ icon, label, href }) => {
        const content = <><Icon name={icon} size={23} /><span className="social-label">{label}</span></>
        return href
          ? <a key={icon} className="social-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>{content}</a>
          : <span key={icon} className="social-link" role="img" aria-label={label} title={label}>{content}</span>
      })}
    </div>
  )
}

const fallbackCategories = [
  { slug: 'hoof-care', name: 'مراقبت از سُم', text: 'پیشگیری و مراقبت برای حرکت سالم دام', icon: 'hoof', color: 'gold' },
  { slug: 'udder-health', name: 'سلامت پستان', text: 'مراقبت روزانه و حمایت از سلامت گله', icon: 'heart', color: 'rose' },
  { slug: 'farm-disinfection', name: 'ضدعفونی دامداری', text: 'بهداشت محیط، تجهیزات و جایگاه دام', icon: 'shield', color: 'green' },
  { slug: 'animal-hygiene', name: 'بهداشت دام و اسب', text: 'محصولات کاربردی برای مراقبت حرفه‌ای', icon: 'spray', color: 'blue' },
]

const fallbackProducts = [
  { id: 1, name: 'هوف ژل فارمیکو', category: 'مراقبت از سُم', price: 385000, tone: 'amber', shape: 'tin', badge: 'پرفروش', image_url: '/images/hoof-gel.jpg' },
  { id: 2, name: 'پماد پستان فارمیکو', category: 'سلامت پستان', price: 460000, tone: 'wine', shape: 'jar', badge: 'پیشنهادی', image_url: '/images/udder-ointment.jpg' },
  { id: 3, name: 'محلول ویروگاردیا', category: 'ضدعفونی دامداری', price: 325000, tone: 'olive', shape: 'bottle', image_url: '/images/virucardia-solution.jpg' },
  { id: 4, name: 'اسپری سُم فارمیکو', category: 'مراقبت از سُم', price: 515000, tone: 'cream', shape: 'spray', image_url: '/images/hoof-spray.jpg' },
]

const fallbackHero = {
  eyebrow: 'دانش دامپزشکی، مراقبت مطمئن',
  title: 'سلامت دام،',
  highlighted_title: 'سرمایه‌ی هر روز شماست.',
  description: 'نیکو سلامت؛ همراه دامداران، اسب‌داران و فعالان کشاورزی با محصولات تخصصی مراقبت، بهداشت و پیشگیری متناسب با نیازهای دامداری ایران.',
  primary_action: 'مشاهده محصولات',
  secondary_action: 'بیشتر درباره ما',
}

const fallbackBenefits = [
  { title: 'کیفیت قابل اعتماد', description: 'انتخاب محصولات تخصصی و کاربردی', icon: 'leaf' },
  { title: 'راهکارهای دامپزشکی', description: 'برای دام سنگین، اسب و جایگاه', icon: 'shield' },
  { title: 'ارسال به سراسر ایران', description: 'تحویل سریع و بسته‌بندی امن', icon: 'truck' },
  { title: 'مشاوره تخصصی', description: 'همراه شما در انتخاب بهتر', icon: 'heart' },
]

const fallbackStory = {
  eyebrow: 'درباره نیکو سلامت',
  title: 'سلامت پایدار دام، از انتخاب درست آغاز می‌شود',
  description: 'نیکو سلامت با تمرکز بر نیاز واقعی دامداری‌ها و مراکز پرورش اسب، محصولات تخصصی مراقبت از سُم، سلامت پستان، ضدعفونی و بهداشت جایگاه را با رویکردی علمی و مسئولانه عرضه می‌کند.',
}

const categoryPageSlugs = ['hoof-care', 'udder-health', 'farm-disinfection', 'animal-hygiene']

const navigationItems = [
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

function NavigationItem({ item, currentPath, navigate, depth = 0 }) {
  const hasChildren = Boolean(item.children?.length)
  const isActive = currentPath === item.path && (item.path === '/' || depth === 0)
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`nav-item nav-depth-${depth} ${hasChildren ? 'has-children' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className="nav-row">
        <a
          className={`nav-link ${isActive ? 'active' : ''}`}
          href={item.path}
          onClick={(event) => navigate(event, item.path)}
        >
          <span>{item.label}</span>
        </a>
        {hasChildren && <button className="submenu-toggle" type="button" aria-label={`نمایش زیرمنوی ${item.label}`} aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}><Icon name="chevron" size={14} /></button>}
      </div>
      {hasChildren && (
        <div className="submenu" role="menu">
          {item.children.map((child) => (
            <NavigationItem
              key={`${item.label}-${child.label}`}
              item={child}
              currentPath={currentPath}
              navigate={navigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price)

function ProductVisual({ product }) {
  if (product.image_url) {
    return <div className="product-visual uploaded"><img src={resolveMediaUrl(product.image_url)} alt={product.name} /></div>
  }
  return (
    <div className={`product-visual ${product.tone}`}>
      <span className="botanical botanical-one">⌁</span>
      <span className="botanical botanical-two">⌁</span>
      <div className={`product-pack ${product.shape}`}>
        {product.shape === 'spray' && <span className="sprayer" />}
        <div className="mini-mark">نیکو سلامت</div>
        <div className="mini-horse">♞</div>
        <small>مراقبت طبیعی</small>
      </div>
    </div>
  )
}

function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <div className="product-art-wrap">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className="wishlist" aria-label={`افزودن ${product.name} به علاقه‌مندی‌ها`}><Icon name="heart" size={19} /></button>
        <ProductVisual product={product} />
      </div>
      <div className="product-info">
        <span>{product.category}</span>
        <h3>{product.name}</h3>
        <div className="product-bottom">
          <p><strong>{formatPrice(product.price)}</strong> تومان</p>
          <button onClick={() => onAddToCart(product)} aria-label={`افزودن ${product.name} به سبد خرید`}><Icon name="plus" size={18} /></button>
        </div>
      </div>
    </article>
  )
}

function PageHero({ eyebrow, title, description }) {
  return (
    <section className="page-hero">
      <div className="page-hero-pattern" aria-hidden="true">♞</div>
      <div className="page-hero-inner">
        <span className="eyebrow light">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}

function ProductsPage({ products, onAddToCart }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('همه محصولات')
  const categories = ['همه محصولات', ...new Set(products.map((product) => product.category))]
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'همه محصولات' || product.category === activeCategory
    const matchesQuery = product.name.includes(query) || product.category.includes(query)
    return matchesCategory && matchesQuery
  })

  return (
    <main className="inner-page" id="top">
      <PageHero
        eyebrow="محصولات نیکو سلامت"
        title="راهکارهای تخصصی برای سلامت دام و اسب"
        description="مجموعه محصولات مراقبت از سُم، سلامت پستان، ضدعفونی و بهداشت جایگاه؛ برای انتخابی مطمئن و کاربردی."
      />
      <section className="section catalog-section">
        <div className="catalog-toolbar">
          <div className="catalog-search"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو میان محصولات..." aria-label="جست‌وجوی محصولات" /></div>
          <span>{new Intl.NumberFormat('fa-IR').format(visibleProducts.length)} محصول</span>
        </div>
        <div className="filter-tabs" aria-label="فیلتر دسته‌بندی">
          {categories.map((category) => (
            <button className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)} key={category}>{category}</button>
          ))}
        </div>
        {visibleProducts.length > 0 ? (
          <div className="product-grid catalog-grid">
            {visibleProducts.map((product) => <ProductCard product={product} onAddToCart={onAddToCart} key={product.id} />)}
          </div>
        ) : (
          <div className="empty-state"><Icon name="search" size={30} /><h2>محصولی پیدا نشد</h2><p>عبارت دیگری را جست‌وجو کنید یا فیلتر را تغییر دهید.</p></div>
        )}
      </section>
    </main>
  )
}

function ContentBody({ text }) {
  return String(text || '').split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
    <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
  ))
}

function ContentPageView({ slug, navigate }) {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getContentPage(slug)
      .then((data) => { setPage(data); setError('') })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <main className="content-loading">در حال دریافت صفحه…</main>
  if (error || !page) return <main className="not-found"><span>۴۰۴</span><h1>این صفحه در دسترس نیست</h1><p>{error}</p><button className="button primary" onClick={(event) => navigate(event, '/')}>بازگشت به خانه</button></main>

  return (
    <main className="inner-page content-page" id="top">
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.summary} />
      <article className="section editorial-content">
        {page.image_url && <img className="editorial-cover" src={resolveMediaUrl(page.image_url)} alt={page.title} />}
        <div className="editorial-body"><ContentBody text={page.body} /></div>
        <a className="button outline" href="/products" onClick={(event) => navigate(event, '/products')}>مشاهده محصولات <Icon name="arrow" size={18} /></a>
      </article>
    </main>
  )
}

function ArticleMeta({ article }) {
  const minutes = Math.max(1, Math.ceil(String(article.body || article.excerpt || '').trim().split(/\s+/).filter(Boolean).length / 200))
  const published = article.created_at ? new Date(article.created_at.replace(' ', 'T')) : null
  return (
    <div className="article-meta">
      <span>{new Intl.NumberFormat('fa-IR').format(minutes)} دقیقه مطالعه</span>
      {published && !Number.isNaN(published.getTime()) && <time dateTime={published.toISOString()}>{new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(published)}</time>}
    </div>
  )
}

function ArticlesPage({ navigate }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticles().then(setArticles).catch(() => setArticles([])).finally(() => setLoading(false))
  }, [])

  return (
    <main className="inner-page magazine-page" id="top">
      <header className="magazine-heading section">
        <span className="eyebrow">دانش و تجربه، از علم تا مزرعه</span>
        <h1>مجله نیکو سلامت</h1>
        <p>مطالب آموزشی و علمی درباره سلامت دام، مراقبت، بهداشت و بهره‌وری پایدار.</p>
      </header>
      <section className="section articles-section">
        {loading ? <div className="content-loading">در حال دریافت مقالات…</div> : articles.length ? (
          <div className="article-grid">
            {articles.map((article, index) => (
              <a className={`article-card ${index === 0 ? 'article-featured' : ''}`} href={`/articles/${article.slug}`} onClick={(event) => navigate(event, `/articles/${article.slug}`)} key={article.id}>
                {article.image_url ? <img src={resolveMediaUrl(article.image_url)} alt={article.title} loading={index === 0 ? 'eager' : 'lazy'} /> : <span className="article-placeholder"><Icon name="leaf" size={48} /></span>}
                <div className="article-card-copy"><span className="eyebrow">{index === 0 ? 'از مجله نیکو سلامت' : 'دانش و تجربه'}</span><h2>{article.title}</h2><p>{article.excerpt}</p><ArticleMeta article={article} /><b>خواندن مقاله <Icon name="arrow" size={16} /></b></div>
              </a>
            ))}
          </div>
        ) : <div className="empty-state"><Icon name="leaf" size={30} /><h2>به‌زودی در مجله نیکو سلامت</h2><p>مطالب تازه درباره سلامت دام و مراقبت‌های روزانه را اینجا بخوانید.</p></div>}
      </section>
    </main>
  )
}

function ArticlePage({ slug, navigate }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getArticle(slug)
      .then((data) => { setArticle(data); setError('') })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <main className="content-loading">در حال دریافت مقاله…</main>
  if (error || !article) return <main className="not-found"><span>۴۰۴</span><h1>مقاله پیدا نشد</h1><p>{error}</p><button className="button primary" onClick={(event) => navigate(event, '/articles')}>بازگشت به مقالات</button></main>

  return (
    <main className="inner-page article-detail" id="top">
      <header className="article-heading">
        <a className="article-back" href="/articles" onClick={(event) => navigate(event, '/articles')}>مجله نیکو سلامت <Icon name="arrow" size={16} /></a>
        <h1>{article.title}</h1>
        {article.excerpt && <p className="article-standfirst">{article.excerpt}</p>}
        <ArticleMeta article={article} />
      </header>
      <article className="section editorial-content">
        {article.image_url && <img className="editorial-cover article-cover" src={resolveMediaUrl(article.image_url)} alt={article.title} />}
        <div className="article-reading">
          <div className="editorial-body"><ContentBody text={article.body} /></div>
          <div className="article-ending"><a className="button outline" href="/articles" onClick={(event) => navigate(event, '/articles')}>مقاله‌های بیشتر <Icon name="arrow" size={18} /></a></div>
        </div>
      </article>
    </main>
  )
}

function AboutPage({ navigate }) {
  const values = [
    { icon: 'heart', title: 'دامپروری', text: 'راهکارهای تخصصی برای ارتقای سلامت و بهداشت دام و افزایش بهره‌وری پایدار دامداری.' },
    { icon: 'shield', title: 'پرورش اسب', text: 'محصولات و راهکارهای مراقبتی متناسب با نیازهای سلامت و بهداشت اسب.' },
    { icon: 'leaf', title: 'کشاورزی', text: 'راهکارهای نوین برای رشد مطلوب گیاهان و کمک به توسعه پایدار کشاورزی.' },
  ]

  return (
    <main className="inner-page" id="top">
      <PageHero eyebrow="درباره شرکت حال نیکو سلامت" title="همراه سلامت و بهره‌وری، از علم تا مزرعه" description="توسعه راهکارهای تخصصی برای دامپروری، پرورش اسب و کشاورزی با تکیه بر دانش، تجربه و تعهد." />
      <section className="section about-intro">
        <div className="about-copy">
          <span className="eyebrow">معرفی شرکت</span>
          <h2>سلامت و بهداشت، پایه‌ی بهره‌وری پایدار</h2>
          <p>در شرکت حال نیکو سلامت، هدف ما روشن است: ارتقای بهداشت و سلامت در سه حوزه دامپروری، پرورش اسب و کشاورزی. با بیش از سه سال تلاش پیوسته و بهره‌گیری از دانش و تجربه متخصصان این حوزه، موفق به توسعه فرمولاسیون‌های نوین و منطبق با استانداردهای جهانی شده‌ایم.</p>
          <p>ما همواره در کنار شما هستیم تا بهترین راهکارها و محصولات تخصصی را برای تضمین سلامت دام، اسب و رشد مطلوب گیاهان در اختیارتان قرار دهیم.</p>
          <p>ما به‌عنوان یک تولیدکننده ایرانی و توزیع‌کننده رسمی محصولات شرکت فارمیوکر (PharmuCare)، مجموعه‌ای متنوع و پیشرفته از محصولات را ارائه می‌کنیم؛ از مراقبت‌های تخصصی سلامت اندام‌های حرکتی دام تا راه‌حل‌های مقابله با تب برفکی و کنترل مگس، با هدف افزایش بهره‌وری و حفظ بهداشت محیط زیست.</p>
          <button className="button primary" onClick={(event) => navigate(event, '/contact')}>ارتباط با حال نیکو سلامت <Icon name="arrow" size={18} /></button>
        </div>
        <div className="about-visual">
          <div className="about-image" role="img" aria-label="دام سالم در محیط دامداری" />
          <div className="about-quote">«همراه دامداران در مسیر سلامت و بهره‌وری»</div>
        </div>
      </section>
      <section className="values-section">
        <div className="section values-inner">
          <div className="section-heading center-heading"><div><span className="eyebrow light">حوزه‌های فعالیت</span><h2>سه مسیر، یک <em>تعهد</em></h2></div></div>
          <div className="values-grid">
            {values.map((value) => <article key={value.title}><span><Icon name={value.icon} size={29} /></span><h3>{value.title}</h3><p>{value.text}</p></article>)}
          </div>
        </div>
      </section>
      <section className="section about-stats">
        <div><strong>+۳ سال</strong><span>تلاش و توسعه</span></div><i />
        <div><strong>۳</strong><span>حوزه تخصصی</span></div><i />
        <div><strong>ایران</strong><span>تولیدکننده ایرانی</span></div><i />
        <div><strong>PharmuCare</strong><span>توزیع‌کننده رسمی</span></div>
      </section>
    </main>
  )
}

const faqItems = [
  ['محصولات حال نیکو سلامت برای چه کسانی مناسب هستند؟', 'در حال حاضر محصولات این مجموعه در حوزه سلامت و مراقبت دام معرفی می‌شوند و مخاطبان اصلی آن‌ها دامداران، مدیران دامداری‌ها، دامپزشکان و مسئولان بهداشت دام هستند. تمرکز فعلی بر نیازهای دامداری‌های گاو شیری است.'],
  ['چه محصولاتی در سبد فعلی مجموعه قرار دارند؟', 'محصولات فعلی شامل ژل سم Hoof Gel در قوطی ۴۸۰ گرمی، پماد پستان Udder Balm در قوطی ۴۰۰ گرمی و ویروگاردیا ViroGuardia در بسته‌بندی ۱۰۰۰ میلی‌لیتری هستند.'],
  ['ژل سم چه کاربردی دارد؟', 'ژل سم فرآورده‌ای موضعی برای مراقبت از سُم دام است که با تمرکز بر مشکلات مرتبط با درماتیت دیجیتال توسعه یافته است. اطلاعات کاربرد و دستورالعمل مصرف در صفحه محصول ارائه می‌شود.'],
  ['پماد پستان برای کدام ناحیه استفاده می‌شود؟', 'پماد پستان برای مراقبت از پوست خارجی پستان و کمک به حفظ نرمی و رطوبت آن در نظر گرفته شده است. این محصول برای مصرف داخل پستان یا دهان معرفی نشده است.'],
  ['ویروگاردیا چیست؟', 'ویروگاردیا فرآورده‌ای تخصصی برای مراقبت موضعی و حمایتی از ضایعات دهانی دام، با تمرکز بر ضایعات مرتبط با تب برفکی است. مصرف آن باید مطابق دستورالعمل محصول و زیر نظر دامپزشک انجام شود.'],
  ['چگونه محصول مناسب را انتخاب کنیم؟', 'انتخاب محصول به محل درگیری، وضعیت دام و نوع مراقبت موردنیاز بستگی دارد. توضیحات صفحه هر محصول را مطالعه کنید و اطلاعات وضعیت دام را با دامپزشک در میان بگذارید.'],
  ['مقدار و دفعات مصرف محصولات چقدر است؟', 'مقدار، دفعات و مدت مصرف هر محصول باید بر اساس دستورالعمل همان محصول و نظر دامپزشک تعیین شود. دستور مصرف یک محصول را برای محصولات دیگر به کار نبرید.'],
  ['آیا می‌توان چند محصول را هم‌زمان استفاده کرد؟', 'امکان استفاده هم‌زمان به نوع محصولات، محل مصرف و وضعیت دام بستگی دارد. پیش از ترکیب فرآورده‌ها یا استفاده از چند محصول روی یک ناحیه، با دامپزشک مشورت کنید.'],
  ['شرایط نگهداری و مدت ماندگاری محصولات چیست؟', 'شرایط نگهداری، تاریخ انقضا و هرگونه محدودیت مصرف پس از بازشدن بسته‌بندی را از روی برچسب همان محصول بررسی کنید.'],
  ['آیا محصولات در شرایط واقعی دامداری ارزیابی شده‌اند؟', 'تمامی محصولات تولید برند PharmuCare در دامداری‌های صنعتی، تحت نظارت دامپزشکان مجرب ارزیابی میدانی شده‌اند. نتایج عملکرد آن‌ها در محدوده کاربردها و شرایط آزموده‌شده، مورد تأیید دامپزشکان ارزیاب قرار گرفته است.'],
  ['برای دریافت اطلاعات تکمیلی محصولات چه کنیم؟', 'از راه‌های ارتباطی همین صفحه، نام محصول و پرسش خود را برای ما ارسال کنید.'],
  ['چگونه از قیمت و موجودی محصولات مطلع شویم؟', 'برای دریافت قیمت و موجودی روز، نوع محصول، تعداد موردنیاز و آدرس خود را از طریق بخش تماس با ما اعلام کنید.'],
  ['برای خرید عمده یا همکاری در توزیع چگونه اقدام کنیم؟', 'دامداری‌ها، شرکت‌های پخش و فروشندگان محصولات دامپزشکی می‌توانند درخواست خود را همراه با نام مجموعه، محدوده فعالیت، محصولات موردنظر و اطلاعات تماس ارسال کنند تا شرایط همکاری بررسی شود.'],
  ['هزینه و زمان ارسال سفارش چگونه مشخص می‌شود؟', 'برای اطلاع از روش ارسال، هزینه و زمان تحویل، مشخصات سفارش و آدرس را اعلام کنید و شرایط نهایی را پیش از ثبت سفارش با مجموعه هماهنگ کنید.'],
]

function ContactPage({ showNotice }) {
  const [sending, setSending] = useState(false)

  const submitContact = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    if (!data.email) delete data.email
    setSending(true)
    try {
      const response = await sendContactMessage(data)
      form.reset()
      showNotice(response.message)
    } catch (error) {
      showNotice(error.name === 'AbortError' ? 'سرور پاسخ نداد؛ دوباره تلاش کنید' : error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="inner-page" id="top">
      <PageHero eyebrow="ارتباط با ما" title="با حال نیکو سلامت در تماس باشید" description="برای دریافت اطلاعات محصولات، استعلام قیمت، ثبت سفارش یا همکاری در توزیع با ما ارتباط بگیرید." />
      <section className="section contact-layout">
        <div className="contact-details">
          <span className="eyebrow">راه‌های ارتباطی</span>
          <h2>پاسخ‌گوی شما هستیم</h2>
          <p>برای مشاوره محصولات، استعلام موجودی یا بررسی شرایط همکاری می‌توانید از راه‌های زیر با مجموعه در تماس باشید.</p>
          <div className="contact-cards">
            <a href="tel:+989124283834"><span><Icon name="user" /></span><div><small>مدیر فروش</small><strong>۰۹۱۲۴۲۸۳۸۳۴</strong></div></a>
            <a href="mailto:info@nikoosalamat.ir"><span><Icon name="heart" /></span><div><small>ایمیل</small><strong>info@nikoosalamat.ir</strong></div></a>
            <a href="https://t.me/nikoosalamat" target="_blank" rel="noreferrer"><span><Icon name="leaf" /></span><div><small>تلگرام</small><strong dir="ltr">@nikoosalamat</strong></div></a>
            <div><span><Icon name="shield" /></span><div><small>آدرس</small><strong>شهر قدس، بلوار ۴۵ متری انقلاب، کوی صنعت، پلاک ۵</strong></div></div>
            <div><span><Icon name="bag" /></span><div><small>کد پستی</small><strong>۳۱۱۴۸۱۵۹۵۵</strong></div></div>
          </div>
          <div className="contact-note"><Icon name="leaf" /><p>برای پاسخ‌گویی دقیق‌تر، نام محصول، تعداد موردنیاز و موضوع درخواست خود را در پیام بنویسید.</p></div>
        </div>
        <form className="contact-form" onSubmit={submitContact}>
          <div className="form-heading"><span>فرم تماس</span><h2>پیامتان را برای ما بنویسید</h2></div>
          <label>نام و نام خانوادگی<input name="name" type="text" placeholder="مثلاً آرش رضایی" minLength="2" required /></label>
          <div className="form-row">
            <label>شماره موبایل<input name="mobile" type="tel" dir="ltr" placeholder="09123456789" pattern="(?:\+98|0098|98|0)?9[0-9]{9}" required /></label>
            <label>ایمیل <small>(اختیاری)</small><input name="email" type="email" dir="ltr" placeholder="you@example.com" /></label>
          </div>
          <label>متن پیام<textarea name="message" rows="6" placeholder="موضوع یا سؤال خود را بنویسید..." minLength="10" required /></label>
          <button className="button primary" type="submit" disabled={sending}>{sending ? 'در حال ارسال...' : 'ارسال پیام'} <Icon name="arrow" size={18} /></button>
          <p className="form-privacy">اطلاعات شما فقط برای پاسخ‌گویی به همین پیام استفاده می‌شود.</p>
        </form>
      </section>
      <section className="faq-section" id="faq">
        <div className="section faq-inner">
          <div className="section-heading center-heading"><div><span className="eyebrow">راهنمای محصولات و سفارش</span><h2>سؤالات <em>متداول</em></h2><p>پاسخ پرسش‌های رایج درباره محصولات، نحوه مصرف، سفارش و همکاری</p></div></div>
          <div className="faq-list">
            {faqItems.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>{question}<span aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

async function readImageFile(file) {
  if (!file?.size) return null
  if (file.size > 3 * 1024 * 1024) throw new Error('حجم تصویر نباید بیشتر از ۳ مگابایت باشد')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('خواندن تصویر ممکن نبود'))
    reader.readAsDataURL(file)
  })
}

function AdminPage({ showNotice }) {
  const [token, setToken] = useState(() => window.sessionStorage.getItem('sovara_admin_token') || '')
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(Boolean(token))
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [pages, setPages] = useState([])
  const [articles, setArticles] = useState([])
  const [editingArticle, setEditingArticle] = useState(null)

  const loadAdminData = async (activeToken = token) => {
    const [nextProducts, nextPages, nextArticles] = await Promise.all([
      getProducts(), getAdminPages(activeToken), getAdminArticles(activeToken),
    ])
    setProducts(nextProducts)
    setPages(nextPages)
    setArticles(nextArticles)
  }

  useEffect(() => {
    if (!token) { setChecking(false); return }
    getAdminProfile(token)
      .then((profile) => { setAdmin(profile); return loadAdminData(token) })
      .catch(() => { window.sessionStorage.removeItem('sovara_admin_token'); setToken(''); setAdmin(null) })
      .finally(() => setChecking(false))
  }, [token])

  const login = async (event) => {
    event.preventDefault(); setBusy(true)
    try {
      const session = await adminLogin(Object.fromEntries(new FormData(event.currentTarget)))
      window.sessionStorage.setItem('sovara_admin_token', session.token)
      setToken(session.token); setAdmin({ username: session.username }); showNotice('با موفقیت وارد شدید')
    } catch (error) { showNotice(error.message) } finally { setBusy(false) }
  }

  const logout = () => {
    if (token) adminLogout(token).catch(() => {})
    window.sessionStorage.removeItem('sovara_admin_token')
    setToken(''); setAdmin(null); setProducts([]); setPages([]); setArticles([])
  }

  const createProduct = async (event) => {
    event.preventDefault(); setBusy(true)
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      await createAdminProduct(token, {
        slug: String(data.get('slug')).trim().toLowerCase(), name: String(data.get('name')).trim(),
        category: String(data.get('category')).trim(), price: Number(data.get('price')),
        tone: data.get('tone'), shape: data.get('shape'), badge: String(data.get('badge') || '').trim() || null,
        featured: data.get('featured') === 'on', image_data: await readImageFile(data.get('image')),
      })
      form.reset(); await loadAdminData(); showNotice('محصول با موفقیت ثبت شد')
    } catch (error) { showNotice(error.message) } finally { setBusy(false) }
  }

  const removeProduct = async (product) => {
    if (!window.confirm(`محصول «${product.name}» حذف شود؟`)) return
    try { await deleteAdminProduct(token, product.id); setProducts((items) => items.filter((item) => item.id !== product.id)); showNotice('محصول حذف شد') } catch (error) { showNotice(error.message) }
  }

  const savePage = async (event, page) => {
    event.preventDefault(); setBusy(true)
    const data = new FormData(event.currentTarget)
    try {
      const updated = await updateAdminPage(token, page.id, {
        eyebrow: String(data.get('eyebrow')).trim(), title: String(data.get('title')).trim(),
        summary: String(data.get('summary')).trim(), body: String(data.get('body')).trim(),
        published: data.get('published') === 'on', image_data: await readImageFile(data.get('image')),
        remove_image: data.get('remove_image') === 'on',
      })
      setPages((items) => items.map((item) => item.id === updated.id ? updated : item)); showNotice('صفحه با موفقیت به‌روزرسانی شد')
    } catch (error) { showNotice(error.message) } finally { setBusy(false) }
  }

  const saveArticle = async (event) => {
    event.preventDefault(); setBusy(true)
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      const payload = {
        slug: String(data.get('slug')).trim().toLowerCase(), title: String(data.get('title')).trim(),
        excerpt: String(data.get('excerpt')).trim(), body: String(data.get('body')).trim(),
        published: data.get('published') === 'on', image_data: await readImageFile(data.get('image')),
        remove_image: data.get('remove_image') === 'on',
      }
      if (editingArticle) await updateAdminArticle(token, editingArticle.id, payload)
      else await createAdminArticle(token, payload)
      setEditingArticle(null); form.reset(); await loadAdminData(); showNotice(editingArticle ? 'مقاله ویرایش شد' : 'مقاله منتشر شد')
    } catch (error) { showNotice(error.message) } finally { setBusy(false) }
  }

  const removeArticle = async (article) => {
    if (!window.confirm(`مقاله «${article.title}» حذف شود؟`)) return
    try { await deleteAdminArticle(token, article.id); setArticles((items) => items.filter((item) => item.id !== article.id)); if (editingArticle?.id === article.id) setEditingArticle(null); showNotice('مقاله حذف شد') } catch (error) { showNotice(error.message) }
  }

  if (checking) return <main className="admin-loading">در حال بررسی دسترسی…</main>
  if (!admin) return (
    <main className="admin-login-page"><section className="admin-login-card">
      <div className="admin-lock"><Icon name="shield" size={30} /></div><span className="eyebrow">ورود امن</span><h1>داشبورد مدیریت نیکو سلامت</h1><p>این بخش فقط برای مدیر سایت قابل دسترسی است.</p>
      <form onSubmit={login}><label>نام کاربری<input name="username" type="text" dir="ltr" autoComplete="username" placeholder="admin" minLength="3" required /></label><label>رمز عبور<input name="password" type="password" dir="ltr" autoComplete="current-password" minLength="4" required /></label><button className="button primary" type="submit" disabled={busy}>{busy ? 'در حال ورود…' : 'ورود به داشبورد'} <Icon name="arrow" size={18} /></button></form>
    </section></main>
  )

  return (
    <main className="admin-page">
      <div className="admin-topbar"><div><span className="eyebrow">پنل مدیریت محتوا</span><h1>مدیریت سایت</h1><p>خوش آمدید، <b dir="ltr">{admin.username}</b></p></div><button className="button admin-logout" onClick={logout}>خروج از حساب</button></div>
      <div className="admin-tabs" role="tablist">
        {[['products', 'محصولات'], ['pages', 'صفحات دسته‌بندی'], ['articles', 'مقالات']].map(([id, label]) => <button className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)} key={id}>{label}</button>)}
      </div>

      {activeTab === 'products' && <div className="admin-layout">
        <form className="admin-product-form" onSubmit={createProduct}>
          <div className="form-heading"><span>محصول تازه</span><h2>افزودن محصول</h2></div>
          <label>نام محصول<input name="name" type="text" minLength="2" required /></label>
          <div className="form-row"><label>شناسه انگلیسی<input name="slug" type="text" dir="ltr" placeholder="hoof-care-oil" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label><label>دسته‌بندی<input name="category" type="text" placeholder="مراقبت از سُم" required /></label></div>
          <div className="form-row three"><label>قیمت (تومان)<input name="price" type="number" dir="ltr" min="0" required /></label><label>رنگ نمایشی<select name="tone" defaultValue="olive"><option value="olive">سبز زیتونی</option><option value="wine">زرشکی</option><option value="amber">کهربایی</option><option value="cream">کرم</option></select></label><label>نوع بسته‌بندی<select name="shape" defaultValue="bottle"><option value="bottle">بطری</option><option value="spray">اسپری</option><option value="tin">قوطی</option><option value="jar">کاسه‌ای</option></select></label></div>
          <label>برچسب <small>(اختیاری)</small><input name="badge" type="text" placeholder="جدید یا پرفروش" maxLength="30" /></label>
          <label className="admin-file">تصویر محصول <small>JPG، PNG یا WebP تا ۳ مگابایت</small><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <label className="admin-check"><input name="featured" type="checkbox" /> نمایش در محصولات پیشنهادی صفحه اصلی</label>
          <button className="button primary" type="submit" disabled={busy}>{busy ? 'در حال ثبت…' : 'ثبت محصول'} <Icon name="plus" size={18} /></button>
        </form>
        <section className="admin-products"><div className="admin-list-head"><div><span>فهرست محصولات</span><h2>{new Intl.NumberFormat('fa-IR').format(products.length)} محصول</h2></div></div><div className="admin-product-list">{products.map((product) => <article key={product.id}><ProductVisual product={product} /><div><span>{product.category}</span><h3>{product.name}</h3><p>{formatPrice(product.price)} تومان</p></div><button onClick={() => removeProduct(product)}>حذف</button></article>)}</div></section>
      </div>}

      {activeTab === 'pages' && <section className="admin-content-list">
        <div className="admin-section-intro"><span>صفحات چهار دسته اصلی</span><h2>ویرایش متن و تصویر صفحات</h2><p>تغییرات هر صفحه را جداگانه ذخیره کنید.</p></div>
        {pages.map((page) => <form className="admin-editor-form" onSubmit={(event) => savePage(event, page)} key={`${page.id}-${page.updated_at}`}>
          <div className="admin-editor-head"><div><span dir="ltr">/pages/{page.slug}</span><h3>{page.title}</h3></div>{page.image_url && <img src={resolveMediaUrl(page.image_url)} alt="" />}</div>
          <div className="form-row"><label>متن بالای عنوان<input name="eyebrow" defaultValue={page.eyebrow} required /></label><label>عنوان صفحه<input name="title" defaultValue={page.title} required /></label></div>
          <label>خلاصه<textarea name="summary" rows="3" defaultValue={page.summary} required /></label><label>متن کامل صفحه<textarea name="body" rows="8" defaultValue={page.body} required /></label>
          <label className="admin-file">تصویر شاخص <small>JPG، PNG یا WebP تا ۳ مگابایت</small><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <div className="admin-options"><label className="admin-check"><input name="published" type="checkbox" defaultChecked={page.published} /> صفحه منتشر باشد</label>{page.image_url && <label className="admin-check danger"><input name="remove_image" type="checkbox" /> حذف تصویر فعلی</label>}</div>
          <button className="button primary" type="submit" disabled={busy}>ذخیره تغییرات</button>
        </form>)}
      </section>}

      {activeTab === 'articles' && <div className="admin-layout admin-articles-layout">
        <form className="admin-product-form admin-editor-form" onSubmit={saveArticle} key={editingArticle?.id || 'new'}>
          <div className="form-heading"><span>{editingArticle ? 'ویرایش مقاله' : 'مقاله تازه'}</span><h2>{editingArticle ? editingArticle.title : 'افزودن مقاله'}</h2></div>
          <label>عنوان مقاله<input name="title" defaultValue={editingArticle?.title || ''} required /></label><label>شناسه انگلیسی<input name="slug" dir="ltr" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="hoof-care-guide" defaultValue={editingArticle?.slug || ''} required /></label>
          <label>خلاصه مقاله<textarea name="excerpt" rows="3" defaultValue={editingArticle?.excerpt || ''} required /></label><label>متن کامل مقاله<textarea name="body" rows="10" defaultValue={editingArticle?.body || ''} required /></label>
          <label className="admin-file">تصویر شاخص <small>JPG، PNG یا WebP تا ۳ مگابایت</small><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <div className="admin-options"><label className="admin-check"><input name="published" type="checkbox" defaultChecked={editingArticle ? editingArticle.published : true} /> نمایش در سایت</label>{editingArticle?.image_url && <label className="admin-check danger"><input name="remove_image" type="checkbox" /> حذف تصویر فعلی</label>}</div>
          <div className="admin-form-actions"><button className="button primary" type="submit" disabled={busy}>{editingArticle ? 'ذخیره مقاله' : 'انتشار مقاله'}</button>{editingArticle && <button className="button outline" type="button" onClick={() => setEditingArticle(null)}>انصراف</button>}</div>
        </form>
        <section className="admin-products"><div className="admin-list-head"><div><span>فهرست مقالات</span><h2>{new Intl.NumberFormat('fa-IR').format(articles.length)} مقاله</h2></div></div><div className="admin-article-list">{articles.map((article) => <article key={article.id}>{article.image_url ? <img src={resolveMediaUrl(article.image_url)} alt="" /> : <span className="article-mini-placeholder"><Icon name="leaf" /></span>}<div><span>{article.published ? 'منتشرشده' : 'پیش‌نویس'}</span><h3>{article.title}</h3><p>{article.excerpt}</p></div><div className="admin-row-actions"><button onClick={() => setEditingArticle(article)}>ویرایش</button><button className="danger" onClick={() => removeArticle(article)}>حذف</button></div></article>)}</div></section>
      </div>}
    </main>
  )
}

export default function App() {
  const siteHeaderRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [notice, setNotice] = useState('')
  const [homeData, setHomeData] = useState(null)
  const [apiOnline, setApiOnline] = useState(false)
  const [catalogProducts, setCatalogProducts] = useState(fallbackProducts)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/$/, '') || '/')

  useEffect(() => {
    const header = siteHeaderRef.current
    if (!header) return
    const announcement = header.querySelector('.announcement')
    const utilityRow = header.querySelector('.header-inner')
    const updateOffset = () => {
      const desktop = window.matchMedia('(min-width: 961px)').matches
      const offset = announcement.offsetHeight + (desktop ? utilityRow.offsetHeight : 0)
      header.style.setProperty('--header-scroll-offset', `${offset}px`)
    }
    const observer = new ResizeObserver(updateOffset)
    observer.observe(announcement)
    observer.observe(utilityRow)
    window.addEventListener('resize', updateOffset)
    updateOffset()
    return () => { observer.disconnect(); window.removeEventListener('resize', updateOffset) }
  }, [])

  useEffect(() => {
    let active = true
    getHomeData()
      .then((data) => {
        if (active) {
          setHomeData(data)
          setApiOnline(true)
        }
      })
      .catch(() => {
        if (active) setApiOnline(false)
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    getProducts()
      .then((data) => setCatalogProducts(data))
      .catch(() => setCatalogProducts(fallbackProducts))
  }, [currentPath])

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname.replace(/\/$/, '') || '/')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    const titles = {
      '/': 'نیکو سلامت | محصولات تخصصی سلامت دام و اسب',
      '/products': 'محصولات | نیکو سلامت',
      '/articles': 'مقالات | نیکو سلامت',
      '/about': 'درباره ما | نیکو سلامت',
      '/contact': 'تماس با ما | نیکو سلامت',
      '/admin': 'داشبورد مدیریت | نیکو سلامت',
    }
    document.title = titles[currentPath] || (currentPath.startsWith('/articles/') ? 'مقاله | نیکو سلامت' : currentPath.startsWith('/pages/') ? 'راهکارهای نیکو سلامت' : titles['/'])
  }, [currentPath])

  const categories = homeData?.categories ?? fallbackCategories
  const products = homeData?.featured_products ?? fallbackProducts
  const hero = homeData?.hero ?? fallbackHero
  const benefits = homeData?.benefits ?? fallbackBenefits
  const navigate = (event, path) => {
    event?.preventDefault()
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
    setCurrentPath(path)
    setMenuOpen(false)
    setSearchOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showNotice = (message) => {
    setNotice(message)
    window.clearTimeout(window.__sovaraNotice)
    window.__sovaraNotice = window.setTimeout(() => setNotice(''), 2600)
  }

  const addToCart = async (product) => {
    setCartCount((count) => count + 1)
    showNotice(`${product.name} به سبد خرید اضافه شد`)

    if (apiOnline) {
      quoteCart([{ product_id: product.id, quantity: 1 }]).catch(() => {
        showNotice('محصول اضافه شد؛ محاسبه آنلاین سبد موقتاً در دسترس نیست')
      })
    }
  }

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const mobile = String(formData.get('mobile') || '')
      .replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))

    try {
      const result = await subscribeNewsletter(mobile)
      form.reset()
      setApiOnline(true)
      showNotice(result.message)
    } catch (error) {
      showNotice(error.name === 'AbortError' ? 'سرور پاسخ نداد؛ دوباره تلاش کنید' : error.message)
    }
  }

  return (
    <div className="site-shell">
      <div className="site-header" ref={siteHeaderRef}>
      <div className="announcement">
        <span>ارسال رایگان سفارش‌های بالای ۱٬۵۰۰٬۰۰۰ تومان</span>
        <span className="announcement-dot" />
        <span>ارتباط با مدیر فروش: ۰۹۱۲۴۲۸۳۸۳۴</span>
      </div>

      <header className="header">
        <div className="header-inner">
          <button className="icon-button mobile-menu-button" aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>

          <a href="/" onClick={(event) => navigate(event, '/')} className="brand" aria-label="صفحه اصلی حال نیکو سلامت">
            <svg className="brand-logo" viewBox="80 80 305 315" aria-hidden="true" focusable="false">
              <image href="/images/hns-logo.png" width="461" height="526" />
            </svg>
          </a>

          <div className="header-actions">
            <button className="icon-button search-button" aria-label="جست‌وجو" onClick={() => setSearchOpen((open) => !open)}><Icon name="search" /></button>
            <a className={`admin-entry ${currentPath === '/admin' ? 'active' : ''}`} href="/admin" onClick={(event) => navigate(event, '/admin')}><Icon name="user" size={18} /><span>ورود</span></a>
            <button className="icon-button cart-button" aria-label={`سبد خرید، ${cartCount} کالا`}>
              <Icon name="bag" />
              {cartCount > 0 && <span className="cart-count">{new Intl.NumberFormat('fa-IR').format(cartCount)}</span>}
            </button>
          </div>
        </div>
        <div className="navigation-bar">
          <nav id="main-navigation" className={`nav ${menuOpen ? 'is-open' : ''}`} aria-label="منوی اصلی">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.label}
                item={item}
                currentPath={currentPath}
                navigate={navigate}
              />
            ))}
          </nav>
        </div>
        {searchOpen && (
          <div className="search-panel">
            <Icon name="search" />
            <input autoFocus type="search" placeholder="جست‌وجوی محصول یا موضوع..." aria-label="جست‌وجو در سایت" />
            <button onClick={() => setSearchOpen(false)} aria-label="بستن جست‌وجو"><Icon name="close" size={19} /></button>
          </div>
        )}
      </header>
      </div>

      {currentPath === '/' && <main id="top">
        <section className="hero-poster" aria-label="معرفی محصولات حال نیکو سلامت">
          <img src="/images/hns-home-banner.png" alt="حال نیکو سلامت؛ از علم تا مزرعه، با حال نیک" />
          <a href="/products" onClick={(event) => navigate(event, '/products')} className="hero-poster-link" aria-label="مشاهده محصولات" title="مشاهده محصولات" />
          <div className="hero-mobile-copy">
            <span>حال نیکو سلامت</span>
            <h1>از علم تا مزرعه، با حال نیک</h1>
            <a href="/products" onClick={(event) => navigate(event, '/products')} className="button primary">مشاهده محصولات <Icon name="arrow" size={17} /></a>
          </div>
        </section>

        <section className="benefits" aria-label="مزایای خرید از نیکو سلامت">
          {benefits.map((benefit) => (
            <div key={benefit.title}><span className="benefit-icon"><Icon name={benefit.icon} /></span><p><strong>{benefit.title}</strong><small>{benefit.description}</small></p></div>
          ))}
        </section>

        <section className="section categories-section" id="categories">
          <div className="section-heading">
            <div><span className="eyebrow">مراقبت کامل</span><h2>هر آنچه برای <em>سلامت دام</em> لازم است</h2></div>
            <a className="view-all" href="/products" onClick={(event) => navigate(event, '/products')}>همه دسته‌بندی‌ها <Icon name="arrow" size={18} /></a>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <a href={`/pages/${categoryPageSlugs[index]}`} onClick={(event) => navigate(event, `/pages/${categoryPageSlugs[index]}`)} className={`category-card ${category.color}`} key={category.name}>
                <span className="category-number">۰{new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(index + 1)}</span>
                <span className="category-icon"><Icon name={category.icon} size={34} /></span>
                <h3>{category.name}</h3>
                <p>{category.description ?? category.text}</p>
                <span className="circle-arrow"><Icon name="arrow" size={18} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="section products-section" id="products">
          <div className="section-heading center-heading">
            <div><span className="eyebrow">انتخاب تخصصی دامداران</span><h2>محصولات <em>پیشنهادی</em></h2></div>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-art-wrap">
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <button className="wishlist" aria-label={`افزودن ${product.name} به علاقه‌مندی‌ها`}><Icon name="heart" size={19} /></button>
                  <ProductVisual product={product} />
                </div>
                <div className="product-info">
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                  <div className="product-bottom">
                    <p><strong>{formatPrice(product.price)}</strong> تومان</p>
                    <button onClick={() => addToCart(product)} aria-label={`افزودن ${product.name} به سبد خرید`}><Icon name="plus" size={18} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button className="button outline products-cta" onClick={(event) => navigate(event, '/products')}>دیدن همه محصولات <Icon name="arrow" size={18} /></button>
        </section>

        <section className="story-video-section" id="story" aria-label="معرفی تصویری حال نیکو سلامت">
          <video autoPlay muted loop playsInline preload="metadata" aria-label="ویدیوی معرفی حال نیکو سلامت">
            <source src="/videos/hns-site-cover.mp4" type="video/mp4" />
          </video>
          <a href="/about" onClick={(event) => navigate(event, '/about')} className="button story-video-link">داستان ما را بخوانید <Icon name="arrow" size={18} /></a>
        </section>

        <section className="newsletter" id="contact">
          <div>
            <span className="eyebrow">باشگاه نیکو سلامت</span>
            <h2>نکته‌های مراقبتی و خبرهای تازه</h2>
            <p>ماهی دو بار؛ کوتاه، کاربردی و بدون پیام‌های اضافه.</p>
          </div>
          <form onSubmit={handleNewsletterSubmit}>
            <input name="mobile" type="tel" inputMode="numeric" placeholder="شماره موبایل" aria-label="شماره موبایل" required pattern="[0-9۰-۹]{10,13}" />
            <button className="button primary" type="submit">عضویت در باشگاه <Icon name="arrow" size={18} /></button>
          </form>
        </section>
      </main>}

      {currentPath === '/products' && <ProductsPage products={catalogProducts} onAddToCart={addToCart} />}
      {currentPath === '/articles' && <ArticlesPage navigate={navigate} />}
      {currentPath.startsWith('/articles/') && <ArticlePage slug={currentPath.slice('/articles/'.length)} navigate={navigate} />}
      {currentPath.startsWith('/pages/') && <ContentPageView slug={currentPath.slice('/pages/'.length)} navigate={navigate} />}
      {currentPath === '/about' && <AboutPage navigate={navigate} />}
      {currentPath === '/contact' && <ContactPage showNotice={showNotice} />}
      {currentPath === '/admin' && <AdminPage showNotice={showNotice} />}
      {!['/', '/products', '/articles', '/about', '/contact', '/admin'].includes(currentPath) && !currentPath.startsWith('/articles/') && !currentPath.startsWith('/pages/') && (
        <main className="not-found"><span>۴۰۴</span><h1>این صفحه پیدا نشد</h1><p>ممکن است آدرس تغییر کرده باشد.</p><button className="button primary" onClick={(event) => navigate(event, '/')}>بازگشت به صفحه اصلی</button></main>
      )}

      {currentPath !== '/admin' && <SocialLinks placement="dock" />}

      {currentPath !== '/admin' && <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-identity"><a href="/" onClick={(event) => navigate(event, '/')} className="brand" aria-label="صفحه اصلی حال نیکو سلامت"><svg className="brand-logo footer-logo" viewBox="80 80 305 315" aria-hidden="true" focusable="false"><image href="/images/hns-logo.png" width="461" height="526" /></svg></a><div><strong>حال نیکو سلامت</strong><p>از علم تا مزرعه، با حال نیک</p></div></div>
            <p>راهکارهای تخصصی برای سلامت پایدار دام.</p>
            <SocialLinks placement="footer" />
          </div>
          <div className="footer-group"><h3>راهکارها</h3><a href="/pages/hoof-care" onClick={(event) => navigate(event, '/pages/hoof-care')}>مراقبت از سُم</a><a href="/pages/udder-health" onClick={(event) => navigate(event, '/pages/udder-health')}>سلامت پستان</a><a href="/pages/farm-disinfection" onClick={(event) => navigate(event, '/pages/farm-disinfection')}>ضدعفونی دامداری</a><a href="/pages/animal-hygiene" onClick={(event) => navigate(event, '/pages/animal-hygiene')}>بهداشت دام و اسب</a></div>
          <div className="footer-group"><h3>راهنما</h3><a href="/about" onClick={(event) => navigate(event, '/about')}>درباره نیکو سلامت</a><a href="/articles" onClick={(event) => navigate(event, '/articles')}>مجله نیکو سلامت</a><a href="/contact" onClick={(event) => navigate(event, '/contact')}>پرسش‌های متداول</a><a href="/contact" onClick={(event) => navigate(event, '/contact')}>ارسال و بازگشت سفارش</a></div>
          <div className="footer-group footer-contact"><h3>ارتباط با ما</h3><a href="tel:+989124283834">۰۹۱۲۴۲۸۳۸۳۴</a><a href="mailto:info@nikoosalamat.ir">info@nikoosalamat.ir</a><span>شهر قدس، کوی صنعت، پلاک ۵</span></div>
        </div>
        <div className="footer-bottom"><span>© ۱۴۰۵ نیکو سلامت؛ همه حقوق محفوظ است.</span><span>با احترام به دام، دامدار و طبیعت</span></div>
      </footer>}

      {notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}
    </div>
  )
}
