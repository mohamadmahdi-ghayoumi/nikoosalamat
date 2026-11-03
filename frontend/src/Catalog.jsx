import React, { useEffect, useState } from 'react'
import Icon from './Icons.jsx'
import { getProduct, resolveMediaUrl } from './api.js'

// Replace these existing photographs when the new campaign banners arrive.
export const heroSlides = [
  { image: '/images/hns-home-banner.png', crop: true, eyebrow: 'حال نیکو سلامت', title: 'از علم تا مزرعه، با حال نیک', text: 'همراه دامداران در مسیر سلامت و بهره‌وری.', action: 'مشاهده محصولات', path: '/products', alt: 'دامپزشک در کنار گاو، اسب و دام‌های مزرعه' },
  { image: '/images/nikoosalamat-about.jpg', eyebrow: 'دانش و تجربه در کنار شما', title: 'مراقبت آگاهانه، هر روز در مزرعه', text: 'راهکارهای مراقبتی و بهداشتی متناسب با نیاز دامداری.', action: 'آشنایی با راهکارها', path: '/pages/udder-health', alt: 'دامپزشک در حال مراقبت از گوساله در دامداری' },
  { image: '/images/nikoosalamat-hero.jpg', eyebrow: 'دام، اسب و مزرعه', title: 'همراه سلامت دام و اسب شما', text: 'با حال نیکو سلامت و حوزه‌های فعالیت ما بیشتر آشنا شوید.', action: 'درباره نیکو سلامت', path: '/about', alt: 'مراقبت دامپزشکی از گاو و اسب در مزرعه' },
]

export function HeroSlider({ navigate }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(!document.hidden)
  const move = (delta) => setActive(index => (index + delta + heroSlides.length) % heroSlides.length)
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  useEffect(() => {
    if (paused || hovered || focused || !visible) return
    const timer = window.setInterval(() => move(1), 6000)
    return () => window.clearInterval(timer)
  }, [paused, hovered, focused, visible, active])
  return (
    <section className="hero-slider" role="region" aria-roledescription="اسلایدر" aria-label="معرفی حال نیکو سلامت"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
      onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(1) } if (event.key === 'ArrowRight') { event.preventDefault(); move(-1) } }}>
      <div className="hero-slides" aria-live={paused ? 'polite' : 'off'}>
        {heroSlides.map((slide, index) => (
          <div className={`hero-slide ${active === index ? 'is-active' : ''}`} key={slide.image} role="group" aria-roledescription="اسلاید" aria-label={`${index + 1} از ${heroSlides.length}`} aria-hidden={active !== index} inert={active !== index ? true : undefined}>
            <div className="hero-copy"><span className="eyebrow">{slide.eyebrow}</span><h1>{slide.title}</h1><p>{slide.text}</p><a className="button primary" href={slide.path} onClick={event => navigate(event, slide.path)}>{slide.action}<Icon name="arrow" size={18} /></a></div>
            <div className="hero-scene">
              {slide.crop ? <svg viewBox="0 0 1260 740" preserveAspectRatio="xMidYMid slice" role="img" aria-label={slide.alt}><image href={slide.image} width="1983" height="793" /></svg> : <img src={slide.image} alt={slide.alt} loading={index === 0 ? 'eager' : 'lazy'} />}
            </div>
          </div>
        ))}
      </div>
      <div className="hero-controls">
        <button className="slider-arrow slider-previous" onClick={() => move(-1)} aria-label="اسلاید قبلی"><Icon name="chevron" size={20} /></button>
        <div className="slider-dots">{heroSlides.map((slide, index) => <button key={slide.image} onClick={() => setActive(index)} aria-label={`نمایش اسلاید ${index + 1}`} aria-pressed={active === index}><span /></button>)}</div>
        <button className="slider-arrow slider-next" onClick={() => move(1)} aria-label="اسلاید بعدی"><Icon name="chevron" size={20} /></button>
        <button className="slider-play" aria-label={paused ? 'شروع پخش خودکار' : 'توقف پخش خودکار'} onClick={() => setPaused(value => !value)}>{paused ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" fill="currentColor" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="3" /></svg>}</button>
      </div>
    </section>
  )
}

const categoryImages = [
  { image: '/images/hns-home-banner.png', crop: '0 430 660 300' },
  { image: '/images/nikoosalamat-about.jpg', position: '65% 45%' },
  { image: '/images/nikoosalamat-hero.jpg', position: '90% 55%' },
  { image: '/images/hero-horse.jpg', position: '65% 35%' },
]

export function CategoryArtwork({ index }) {
  const art = categoryImages[index % categoryImages.length]
  return <div className="category-photo" aria-hidden="true">{art.crop ? <svg viewBox={art.crop} preserveAspectRatio="xMidYMid slice"><image href={art.image} width="1983" height="793" /></svg> : <img src={art.image} alt="" loading="lazy" style={{ objectPosition: art.position }} />}</div>
}

const summaries = {
  'مراقبت از سُم': 'مراقبت و بهداشت سُم دام در برنامه روزانه دامداری.',
  'سلامت پستان': 'مراقبت از پوست خارجی پستان دام.',
  'ضدعفونی دامداری': 'راهکارهای بهداشتی برای دام و دامداری.',
  'بهداشت دامداری': 'بهداشت محیط و جایگاه نگهداری دام.',
}
export const productSummary = product => product.catalog?.summary || (/ویروگاردیا/.test(product.name) ? 'محلول مراقبت دهانی دام.' : summaries[product.category] || `آشنایی با ${product.name} و مشخصات آن.`)
export const productPath = product => `/products/${product.id}`

export function ProductVisual({ product }) {
  if (product.image_url) return <div className="product-visual uploaded"><img src={resolveMediaUrl(product.image_url)} alt={product.name} loading="lazy" /></div>
  return <div className={`product-visual ${product.tone}`}><div className={`product-pack ${product.shape}`}>
    {product.shape === 'spray' && <span className="sprayer" />}<div className="mini-mark">نیکو سلامت</div><div className="mini-horse">♞</div><small>{product.category}</small>
  </div></div>
}

export function ProductCard({ product, navigate }) {
  const path = productPath(product)
  return <article className="product-card catalog-product-card">
    <a className="product-art-wrap" href={path} onClick={event => navigate(event, path)} aria-label={`مشاهده ${product.name}`}>
      {product.badge && <span className="product-badge">{product.badge}</span>}<ProductVisual product={product} />
    </a>
    <div className="product-info"><span>{product.category}</span><h3><a href={path} onClick={event => navigate(event, path)}>{product.name}</a></h3><p className="product-summary">{productSummary(product)}</p>
      <div className="product-price"><strong>{new Intl.NumberFormat('fa-IR').format(product.price)}</strong><span>تومان</span></div>
      <a className="button product-view" href={path} onClick={event => navigate(event, path)}>مشاهده محصول<Icon name="arrow" size={17} /></a>
    </div>
  </article>
}

export function ProductDetail({ id, navigate, onAddToCart }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState(null)
  useEffect(() => {
    let active = true
    setLoading(true); setFailed(false); setSelected(null)
    getProduct(id).then(data => { if (active) { setProduct(data); document.title = `${data.name} | نیکو سلامت` } }).catch(() => { if (active) setFailed(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])
  if (loading) return <main className="content-loading">در حال دریافت محصول…</main>
  if (failed || !product) return <main className="not-found"><h1>محصول در دسترس نیست</h1><p>لطفاً دوباره تلاش کنید یا به فهرست محصولات برگردید.</p><a className="button primary" href="/products" onClick={event => navigate(event, '/products')}>همه محصولات</a></main>
  const catalog = product.catalog || {}
  const images = [...new Set([product.image_url, ...(catalog.gallery || [])].filter(Boolean))]
  const mainImage = selected || images[0]
  const features = catalog.features?.length ? catalog.features : [`گروه محصول: ${product.category}`, `نوع بسته‌بندی: ${{ bottle: 'بطری', spray: 'اسپری', tin: 'قوطی', jar: 'ظرف' }[product.shape] || product.shape}`]
  const description = catalog.description || `${product.name} از مجموعه محصولات حال نیکو سلامت در گروه ${product.category} است. ${productSummary(product)}`
  const usage = catalog.usage || 'مقدار، دفعات و نحوه مصرف را از روی برچسب همین محصول بررسی کنید و مطابق دستورالعمل تولیدکننده و نظر دامپزشک اقدام کنید.'
  return <main className="inner-page product-detail" id="top">
    <div className="section product-detail-shell">
      <nav className="product-breadcrumb" aria-label="مسیر صفحه"><a href="/" onClick={event => navigate(event, '/')}>خانه</a><span>/</span><a href="/products" onClick={event => navigate(event, '/products')}>محصولات</a><span>/</span><span>{product.name}</span></nav>
      <section className="product-overview">
        <div className="product-gallery"><div className="product-main-image"><ProductVisual product={{ ...product, image_url: mainImage }} /></div>
          {images.length > 1 && <div className="product-thumbnails" aria-label="تصاویر محصول">{images.map((image, index) => <button key={image} onClick={() => setSelected(image)} aria-label={`تصویر ${index + 1} محصول`} aria-pressed={mainImage === image}><img src={resolveMediaUrl(image)} alt="" /></button>)}</div>}
        </div>
        <div className="product-overview-copy"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><p className="product-intro">{productSummary(product)}</p>
          <dl className="product-specs"><div><dt>دسته‌بندی</dt><dd>{product.category}</dd></div><div><dt>نوع بسته‌بندی</dt><dd>{{ bottle: 'بطری', spray: 'اسپری', tin: 'قوطی', jar: 'ظرف' }[product.shape] || product.shape}</dd></div></dl>
          <div className="product-detail-price"><strong>{new Intl.NumberFormat('fa-IR').format(product.price)}</strong><span>تومان</span></div>
          <div className="product-detail-actions"><button className="button primary" onClick={() => onAddToCart(product)}>افزودن به سبد خرید<Icon name="bag" size={18} /></button><a className="button outline" href="/contact" onClick={event => navigate(event, '/contact')}>مشاوره درباره محصول</a></div>
        </div>
      </section>
      <nav className="product-section-links" aria-label="بخش‌های معرفی محصول"><a href="#product-introduction">معرفی محصول</a><a href="#product-features">ویژگی‌ها و مشخصات</a><a href="#product-usage">روش مصرف</a></nav>
      <div className="product-editorial"><section id="product-introduction"><span className="eyebrow">آشنایی با محصول</span><h2>معرفی {product.name}</h2><div className="product-rich-text">{description}</div></section>
        <section id="product-features"><h2>ویژگی‌ها و مشخصات</h2><ul>{features.map((feature, index) => <li key={index}><Icon name="leaf" size={18} /><span>{feature}</span></li>)}</ul></section>
        <section id="product-usage"><h2>روش مصرف</h2><div className="product-rich-text">{usage}</div></section>
      </div>
      <a className="view-all" href="/products" onClick={event => navigate(event, '/products')}>بازگشت به همه محصولات<Icon name="arrow" size={18} /></a>
    </div>
  </main>
}

export function CatalogEditor({ product, busy, onSave, onCancel }) {
  const catalog = product.catalog || {}
  return <form className="admin-editor-form catalog-editor" onSubmit={event => onSave(event, product)} key={product.id}>
    <div className="admin-editor-head"><div><span>صفحه اختصاصی محصول</span><h3>{product.name}</h3></div><button className="button outline" type="button" onClick={onCancel}>بستن</button></div>
    <label>کاربرد کوتاه روی کارت محصول<textarea name="summary" rows="2" maxLength="350" defaultValue={catalog.summary || ''} /></label>
    <label>معرفی کامل<textarea name="description" rows="5" maxLength="15000" defaultValue={catalog.description || ''} /></label>
    <label>ویژگی‌ها <small>هر ویژگی در یک خط، حداکثر ۲۰ مورد</small><textarea name="features" rows="5" defaultValue={(catalog.features || []).join('\n')} /></label>
    <label>روش مصرف <small>مطابق اطلاعات تأییدشده محصول</small><textarea name="usage" rows="5" maxLength="10000" defaultValue={catalog.usage || ''} /></label>
    {!!catalog.gallery?.length && <div className="admin-gallery">{catalog.gallery.map(url => <label key={url}><img src={resolveMediaUrl(url)} alt="تصویر گالری محصول" /><span><input type="checkbox" name="gallery" value={url} defaultChecked /> نگهداری تصویر</span></label>)}</div>}
    <label className="admin-file">تصاویر بیشتر محصول <small>تا ۵ تصویر JPG، PNG یا WebP؛ هر فایل تا ۳ مگابایت و مجموع فایل‌های جدید تا ۵ مگابایت</small><input type="file" name="gallery_images" multiple accept="image/jpeg,image/png,image/webp" /></label>
    <div className="admin-form-actions"><button className="button primary" disabled={busy}>ذخیره کاتالوگ محصول</button><button className="button outline" type="button" onClick={onCancel}>انصراف</button></div>
  </form>
}
