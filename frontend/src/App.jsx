import React, { useEffect, useState } from 'react'
import { adminLogin, adminLogout, createAdminProduct, deleteAdminProduct, getAdminProfile, getHomeData, getProducts, quoteCart, resolveMediaUrl, sendContactMessage, subscribeNewsletter } from './api.js'

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
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

const fallbackCategories = [
  { name: 'مراقبت از پوست و مو', text: 'درخشش طبیعی و سلامت ماندگار', icon: 'sparkle', color: 'rose' },
  { name: 'مراقبت از سُم', text: 'استحکام و انعطاف در هر قدم', icon: 'hoof', color: 'gold' },
  { name: 'محافظت و آرامش', text: 'برای تمرین و استراحت بهتر', icon: 'shield', color: 'green' },
  { name: 'لوازم نظافت', text: 'همراه همیشگی اصطبل', icon: 'spray', color: 'blue' },
]

const fallbackProducts = [
  { id: 1, name: 'روغن تقویت سُم آرنیکا', category: 'مراقبت از سُم', price: 385000, tone: 'amber', shape: 'tin', badge: 'پرفروش' },
  { id: 2, name: 'اسپری درخشان‌کننده یال', category: 'پوست و مو', price: 460000, tone: 'wine', shape: 'spray', badge: 'جدید' },
  { id: 3, name: 'شامپو گیاهی ملایم', category: 'شست‌وشو', price: 325000, tone: 'olive', shape: 'bottle' },
  { id: 4, name: 'بالم آرامش عضلات', category: 'ریکاوری', price: 515000, tone: 'cream', shape: 'jar' },
]

const fallbackHero = {
  eyebrow: 'مراقبت سالم، رفاقت عمیق‌تر',
  title: 'حال خوب اسب،',
  highlighted_title: 'قصه‌ی هر روز ماست.',
  description: 'محصولات تخصصی مراقبت از اسب با ترکیبات گیاهی و فرمولاسیون سازگار؛ طراحی و تولیدشده برای اقلیم ایران.',
  primary_action: 'مشاهده محصولات',
  secondary_action: 'بیشتر درباره ما',
}

const fallbackBenefits = [
  { title: 'ترکیبات گیاهی', description: 'ملایم و سازگار با پوست', icon: 'leaf' },
  { title: 'تضمین اصالت', description: 'تولید با مواد اولیه مرغوب', icon: 'shield' },
  { title: 'ارسال به سراسر ایران', description: 'تحویل سریع و بسته‌بندی امن', icon: 'truck' },
  { title: 'مشاوره تخصصی', description: 'همراه شما در انتخاب بهتر', icon: 'heart' },
]

const fallbackStory = {
  eyebrow: 'قصه‌ی سُوارا',
  title: 'از دل طبیعت ایران، برای سلامت همراه نجیب شما',
  description: 'ما سُوارا را با یک باور ساده آغاز کردیم: مراقبت خوب باید هم علمی باشد، هم مهربان. فرمول‌های ما با شناخت نیازهای اسب و شرایط آب‌وهوایی ایران توسعه پیدا می‌کنند.',
}

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
    path: '/about',
    children: [
      { label: 'سلامت دام', path: '/about' },
      { label: 'بیماری‌ها', path: '/about' },
      { label: 'آموزش', path: '/about' },
      { label: 'مقالات علمی', path: '/about' },
      { label: 'اخبار', path: '/about' },
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

  return (
    <div className={`nav-item nav-depth-${depth} ${hasChildren ? 'has-children' : ''}`}>
      <a
        className={`nav-link ${isActive ? 'active' : ''}`}
        href={item.path}
        onClick={(event) => navigate(event, item.path)}
        aria-haspopup={hasChildren ? 'true' : undefined}
      >
        <span>{item.label}</span>
        {hasChildren && <Icon name="chevron" size={14} />}
      </a>
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
        <div className="mini-mark">سُوارا</div>
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
        eyebrow="فروشگاه سُوارا"
        title="مراقبت حرفه‌ای، برای هر روز کنار هم بودن"
        description="مجموعه محصولات تخصصی مراقبت از پوست، مو، سُم و ریکاوری اسب؛ متناسب با شرایط آب‌وهوایی ایران."
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

function AboutPage({ navigate }) {
  const values = [
    { icon: 'leaf', title: 'فرمول‌های مسئولانه', text: 'انتخاب ترکیبات ملایم و مؤثر با کمترین فشار بر طبیعت.' },
    { icon: 'shield', title: 'شفافیت و کیفیت', text: 'کنترل کیفیت مرحله‌به‌مرحله و ارائه اطلاعات روشن برای هر محصول.' },
    { icon: 'heart', title: 'رفاقت، نه فقط مراقبت', text: 'هر محصول باید تجربه حضور کنار اسب را آرام‌تر و لذت‌بخش‌تر کند.' },
  ]

  return (
    <main className="inner-page" id="top">
      <PageHero eyebrow="درباره سُوارا" title="یک برند ایرانی، برای رفاقتی که هر روز عمیق‌تر می‌شود" description="سُوارا با ترکیب دانش مراقبت، شناخت اقلیم ایران و احترام به رابطه انسان و اسب شکل گرفته است." />
      <section className="section about-intro">
        <div className="about-copy">
          <span className="eyebrow">داستان ما</span>
          <h2>مراقبت خوب، از شناخت درست شروع می‌شود</h2>
          <p>ما کارمان را با گفت‌وگو با سوارکارها، مربی‌ها و صاحبان باشگاه‌ها آغاز کردیم. هدفمان ساخت محصولاتی بود که در برنامه روزانه اصطبل کاربردی باشند؛ محصولاتی قابل اعتماد، ساده و سازگار با نیاز واقعی اسب.</p>
          <p>از انتخاب ماده اولیه تا بسته‌بندی، تلاش می‌کنیم کیفیت قابل لمس باشد و مصرف‌کننده دقیقاً بداند چه چیزی برای همراهش انتخاب می‌کند.</p>
          <button className="button primary" onClick={(event) => navigate(event, '/contact')}>گفت‌وگو با تیم سُوارا <Icon name="arrow" size={18} /></button>
        </div>
        <div className="about-visual">
          <div className="about-image" role="img" aria-label="مراقبت از اسب در اصطبل" />
          <div className="about-quote">«حال خوب اسب، معیار تمام تصمیم‌های ماست.»</div>
        </div>
      </section>
      <section className="values-section">
        <div className="section values-inner">
          <div className="section-heading center-heading"><div><span className="eyebrow light">ارزش‌های ما</span><h2>چیزی که به آن <em>متعهدیم</em></h2></div></div>
          <div className="values-grid">
            {values.map((value) => <article key={value.title}><span><Icon name={value.icon} size={29} /></span><h3>{value.title}</h3><p>{value.text}</p></article>)}
          </div>
        </div>
      </section>
      <section className="section about-stats">
        <div><strong>+۱۲</strong><span>محصول تخصصی</span></div><i />
        <div><strong>+۳۵۰</strong><span>مشتری همراه</span></div><i />
        <div><strong>۲۴</strong><span>شهر تحت پوشش</span></div><i />
        <div><strong>۴٫۹</strong><span>امتیاز رضایت</span></div>
      </section>
    </main>
  )
}

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
      <PageHero eyebrow="ارتباط با ما" title="سؤالی دارید؟ کنار شما هستیم" description="برای انتخاب محصول، دریافت مشاوره یا پیگیری سفارش با تیم سُوارا در ارتباط باشید." />
      <section className="section contact-layout">
        <div className="contact-details">
          <span className="eyebrow">راه‌های ارتباطی</span>
          <h2>بیایید گفت‌وگو کنیم</h2>
          <p>کارشناسان ما در ساعات کاری پاسخ‌گوی پرسش‌های شما درباره مراقبت، انتخاب محصول و سفارش‌ها هستند.</p>
          <div className="contact-cards">
            <a href="tel:+982188771420"><span><Icon name="user" /></span><div><small>تلفن پشتیبانی</small><strong>۰۲۱-۸۸۷۷ ۱۴۲۰</strong></div></a>
            <a href="mailto:hello@sovara.ir"><span><Icon name="heart" /></span><div><small>ایمیل</small><strong>hello@sovara.ir</strong></div></a>
            <div><span><Icon name="shield" /></span><div><small>ساعات پاسخ‌گویی</small><strong>شنبه تا چهارشنبه، ۹ تا ۱۷</strong></div></div>
          </div>
          <div className="contact-note"><Icon name="leaf" /><p>برای مشاوره دقیق‌تر، سن اسب و موضوع موردنظرتان را در پیام بنویسید.</p></div>
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
    </main>
  )
}

function AdminPage({ showNotice }) {
  const [token, setToken] = useState(() => window.sessionStorage.getItem('sovara_admin_token') || '')
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(Boolean(token))
  const [busy, setBusy] = useState(false)
  const [products, setProducts] = useState([])

  const loadProducts = () => getProducts().then(setProducts).catch((error) => showNotice(error.message))

  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }
    getAdminProfile(token)
      .then((profile) => {
        setAdmin(profile)
        loadProducts()
      })
      .catch(() => {
        window.sessionStorage.removeItem('sovara_admin_token')
        setToken('')
      })
      .finally(() => setChecking(false))
  }, [token])

  const login = async (event) => {
    event.preventDefault()
    setBusy(true)
    const credentials = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const session = await adminLogin(credentials)
      window.sessionStorage.setItem('sovara_admin_token', session.token)
      setToken(session.token)
      setAdmin({ username: session.username })
      showNotice('با موفقیت وارد شدید')
    } catch (error) {
      showNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  const logout = async () => {
    if (token) adminLogout(token).catch(() => {})
    window.sessionStorage.removeItem('sovara_admin_token')
    setToken('')
    setAdmin(null)
    setProducts([])
  }

  const createProduct = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const file = formData.get('image')
    setBusy(true)
    try {
      let imageData = null
      if (file?.size) {
        if (file.size > 3 * 1024 * 1024) throw new Error('حجم تصویر نباید بیشتر از ۳ مگابایت باشد')
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(new Error('خواندن تصویر ممکن نبود'))
          reader.readAsDataURL(file)
        })
      }
      await createAdminProduct(token, {
        slug: String(formData.get('slug')).trim().toLowerCase(),
        name: String(formData.get('name')).trim(),
        category: String(formData.get('category')).trim(),
        price: Number(formData.get('price')),
        tone: formData.get('tone'),
        shape: formData.get('shape'),
        badge: String(formData.get('badge') || '').trim() || null,
        featured: formData.get('featured') === 'on',
        image_data: imageData,
      })
      form.reset()
      await loadProducts()
      showNotice('محصول با موفقیت ثبت شد')
    } catch (error) {
      showNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  const removeProduct = async (product) => {
    if (!window.confirm(`محصول «${product.name}» حذف شود؟`)) return
    try {
      await deleteAdminProduct(token, product.id)
      setProducts((items) => items.filter((item) => item.id !== product.id))
      showNotice('محصول حذف شد')
    } catch (error) {
      showNotice(error.message)
    }
  }

  if (checking) return <main className="admin-loading">در حال بررسی دسترسی…</main>

  if (!admin) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-card">
          <div className="admin-lock"><Icon name="shield" size={30} /></div>
          <span className="eyebrow">ورود امن</span>
          <h1>داشبورد مدیریت سُوارا</h1>
          <p>این بخش فقط برای مدیر سایت قابل دسترسی است.</p>
          <form onSubmit={login}>
            <label>نام کاربری<input name="username" type="text" dir="ltr" autoComplete="username" placeholder="admin" minLength="3" required /></label>
            <label>رمز عبور<input name="password" type="password" dir="ltr" autoComplete="current-password" minLength="4" required /></label>
            <button className="button primary" type="submit" disabled={busy}>{busy ? 'در حال ورود…' : 'ورود به داشبورد'} <Icon name="arrow" size={18} /></button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <div><span className="eyebrow">پنل مدیریت</span><h1>مدیریت محصولات</h1><p>خوش آمدید، <b dir="ltr">{admin.username}</b></p></div>
        <button className="button admin-logout" onClick={logout}>خروج از حساب</button>
      </div>
      <div className="admin-layout">
        <form className="admin-product-form" onSubmit={createProduct}>
          <div className="form-heading"><span>محصول تازه</span><h2>افزودن محصول</h2></div>
          <label>نام محصول<input name="name" type="text" minLength="2" required /></label>
          <div className="form-row">
            <label>شناسه انگلیسی<input name="slug" type="text" dir="ltr" placeholder="hoof-care-oil" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
            <label>دسته‌بندی<input name="category" type="text" placeholder="مراقبت از سُم" required /></label>
          </div>
          <div className="form-row three">
            <label>قیمت (تومان)<input name="price" type="number" dir="ltr" min="0" required /></label>
            <label>رنگ نمایشی<select name="tone" defaultValue="olive"><option value="olive">سبز زیتونی</option><option value="wine">زرشکی</option><option value="amber">کهربایی</option><option value="cream">کرم</option></select></label>
            <label>نوع بسته‌بندی<select name="shape" defaultValue="bottle"><option value="bottle">بطری</option><option value="spray">اسپری</option><option value="tin">قوطی</option><option value="jar">کاسه‌ای</option></select></label>
          </div>
          <label>برچسب <small>(اختیاری)</small><input name="badge" type="text" placeholder="جدید یا پرفروش" maxLength="30" /></label>
          <label className="admin-file">تصویر محصول <small>JPG، PNG یا WebP تا ۳ مگابایت</small><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <label className="admin-check"><input name="featured" type="checkbox" /> نمایش در محصولات پیشنهادی صفحه اصلی</label>
          <button className="button primary" type="submit" disabled={busy}>{busy ? 'در حال ثبت…' : 'ثبت محصول'} <Icon name="plus" size={18} /></button>
        </form>
        <section className="admin-products">
          <div className="admin-list-head"><div><span>فهرست محصولات</span><h2>{new Intl.NumberFormat('fa-IR').format(products.length)} محصول</h2></div></div>
          <div className="admin-product-list">
            {products.map((product) => (
              <article key={product.id}>
                <ProductVisual product={product} />
                <div><span>{product.category}</span><h3>{product.name}</h3><p>{formatPrice(product.price)} تومان</p></div>
                <button onClick={() => removeProduct(product)} aria-label={`حذف ${product.name}`}>حذف</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [notice, setNotice] = useState('')
  const [homeData, setHomeData] = useState(null)
  const [apiOnline, setApiOnline] = useState(false)
  const [catalogProducts, setCatalogProducts] = useState(fallbackProducts)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/$/, '') || '/')

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
      '/': 'سُوارا | مراقبت حرفه‌ای از اسب',
      '/products': 'محصولات | سُوارا',
      '/about': 'درباره ما | سُوارا',
      '/contact': 'تماس با ما | سُوارا',
      '/admin': 'داشبورد مدیریت | سُوارا',
    }
    document.title = titles[currentPath] || titles['/']
  }, [currentPath])

  const categories = homeData?.categories ?? fallbackCategories
  const products = homeData?.featured_products ?? fallbackProducts
  const hero = homeData?.hero ?? fallbackHero
  const benefits = homeData?.benefits ?? fallbackBenefits
  const story = homeData?.story ?? fallbackStory

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
      <div className="announcement">
        <span>ارسال رایگان سفارش‌های بالای ۱٬۵۰۰٬۰۰۰ تومان</span>
        <span className="announcement-dot" />
        <span>مشاوره رایگان انتخاب محصول: ۰۲۱-۸۸۷۷ ۱۴۲۰</span>
      </div>

      <header className="header">
        <div className="header-inner">
          <button className="icon-button mobile-menu-button" aria-label="باز کردن منو" onClick={() => setMenuOpen((open) => !open)}>
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>

          <a href="/" onClick={(event) => navigate(event, '/')} className="brand" aria-label="صفحه اصلی سوارا">
            <span className="brand-mark">س</span>
            <span className="brand-copy">
              <strong>سُوارا</strong>
              <small>SOVARA</small>
            </span>
          </a>

          <nav className={`nav ${menuOpen ? 'is-open' : ''}`} aria-label="منوی اصلی">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.label}
                item={item}
                currentPath={currentPath}
                navigate={navigate}
              />
            ))}
          </nav>

          <div className="header-actions">
            <button className="icon-button search-button" aria-label="جست‌وجو" onClick={() => setSearchOpen((open) => !open)}><Icon name="search" /></button>
            <a className={`admin-entry ${currentPath === '/admin' ? 'active' : ''}`} href="/admin" onClick={(event) => navigate(event, '/admin')}><Icon name="user" size={18} /><span>ورود</span></a>
            <button className="icon-button cart-button" aria-label={`سبد خرید، ${cartCount} کالا`}>
              <Icon name="bag" />
              {cartCount > 0 && <span className="cart-count">{new Intl.NumberFormat('fa-IR').format(cartCount)}</span>}
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="search-panel">
            <Icon name="search" />
            <input autoFocus type="search" placeholder="جست‌وجوی محصول یا موضوع..." aria-label="جست‌وجو در سایت" />
            <button onClick={() => setSearchOpen(false)} aria-label="بستن جست‌وجو"><Icon name="close" size={19} /></button>
          </div>
        )}
      </header>

      {currentPath === '/' && <main id="top">
        <section className="hero">
          <div className="hero-image" role="img" aria-label="مراقبت صمیمانه از اسب در اصطبل">
            <div className="hero-stamp">
              <span>ساخت ایران</span>
              <b>با عشق</b>
            </div>
            <div className="photo-credit">تصویر: Unsplash</div>
          </div>
          <div className="hero-copy">
            <span className="eyebrow"><Icon name="leaf" size={18} /> {hero.eyebrow}</span>
            <h1>{hero.title}<br /><em>{hero.highlighted_title}</em></h1>
            <p>{hero.description}</p>
            <div className="hero-actions">
              <button className="button primary" onClick={(event) => navigate(event, '/products')}>{hero.primary_action} <Icon name="arrow" size={19} /></button>
              <a className="text-link" href="/about" onClick={(event) => navigate(event, '/about')}>{hero.secondary_action}</a>
            </div>
            <div className="hero-trust">
              <div><strong>+۱۲</strong><span>محصول تخصصی</span></div>
              <i />
              <div><strong>۱۰۰٪</strong><span>تست‌شده و ایمن</span></div>
              <i />
              <div><strong>۴٫۹</strong><span>رضایت مشتریان</span></div>
            </div>
          </div>
        </section>

        <section className="benefits" aria-label="مزایای خرید از سوارا">
          {benefits.map((benefit) => (
            <div key={benefit.title}><span className="benefit-icon"><Icon name={benefit.icon} /></span><p><strong>{benefit.title}</strong><small>{benefit.description}</small></p></div>
          ))}
        </section>

        <section className="section categories-section" id="categories">
          <div className="section-heading">
            <div><span className="eyebrow">مراقبت کامل</span><h2>هر آنچه برای <em>رفیقتان</em> لازم است</h2></div>
            <a className="view-all" href="/products" onClick={(event) => navigate(event, '/products')}>همه دسته‌بندی‌ها <Icon name="arrow" size={18} /></a>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <a href="/products" onClick={(event) => navigate(event, '/products')} className={`category-card ${category.color}`} key={category.name}>
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
            <div><span className="eyebrow">انتخاب محبوب سوارکارها</span><h2>محصولات <em>پیشنهادی</em></h2></div>
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

        <section className="story-section" id="story">
          <div className="story-pattern" aria-hidden="true">♞</div>
          <div className="story-copy">
            <span className="eyebrow light">{story.eyebrow}</span>
            <h2>{story.title}</h2>
            <p>{story.description}</p>
            <a href="/about" onClick={(event) => navigate(event, '/about')} className="button light-button">داستان ما را بخوانید <Icon name="arrow" size={18} /></a>
          </div>
          <div className="story-seal"><Icon name="leaf" size={28} /><span>طبیعی و مسئولانه</span></div>
        </section>

        <section className="newsletter" id="contact">
          <div>
            <span className="eyebrow">باشگاه سُوارا</span>
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
      {currentPath === '/about' && <AboutPage navigate={navigate} />}
      {currentPath === '/contact' && <ContactPage showNotice={showNotice} />}
      {currentPath === '/admin' && <AdminPage showNotice={showNotice} />}
      {!['/', '/products', '/about', '/contact', '/admin'].includes(currentPath) && (
        <main className="not-found"><span>۴۰۴</span><h1>این صفحه پیدا نشد</h1><p>ممکن است آدرس تغییر کرده باشد.</p><button className="button primary" onClick={(event) => navigate(event, '/')}>بازگشت به صفحه اصلی</button></main>
      )}

      {currentPath !== '/admin' && <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="/" onClick={(event) => navigate(event, '/')} className="brand brand-light"><span className="brand-mark">س</span><span className="brand-copy"><strong>سُوارا</strong><small>SOVARA</small></span></a>
            <p>مراقبت آگاهانه برای یک رفاقت ماندگار.</p>
            <div className="socials"><a href="#instagram" aria-label="اینستاگرام"><Icon name="instagram" /></a><span>@sovara.care</span></div>
          </div>
          <div><h3>محصولات</h3><a href="/products" onClick={(event) => navigate(event, '/products')}>پوست و مو</a><a href="/products" onClick={(event) => navigate(event, '/products')}>مراقبت از سُم</a><a href="/products" onClick={(event) => navigate(event, '/products')}>شست‌وشو</a><a href="/products" onClick={(event) => navigate(event, '/products')}>آرامش و ریکاوری</a></div>
          <div><h3>راهنما</h3><a href="/about" onClick={(event) => navigate(event, '/about')}>درباره سُوارا</a><a href="/contact" onClick={(event) => navigate(event, '/contact')}>پرسش‌های متداول</a><a href="/contact" onClick={(event) => navigate(event, '/contact')}>روش ارسال</a><a href="/contact" onClick={(event) => navigate(event, '/contact')}>شرایط بازگشت</a></div>
          <div><h3>ارتباط با ما</h3><a href="tel:+982188771420">۰۲۱-۸۸۷۷ ۱۴۲۰</a><a href="mailto:hello@sovara.ir">hello@sovara.ir</a><span>شنبه تا چهارشنبه، ۹ تا ۱۷</span></div>
        </div>
        <div className="footer-bottom"><span>© ۱۴۰۵ سُوارا؛ همه حقوق محفوظ است.</span><span>ساخته‌شده با احترام به اسب و طبیعت</span></div>
      </footer>}

      {notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}
    </div>
  )
}
