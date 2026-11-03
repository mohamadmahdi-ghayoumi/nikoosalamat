import React, { useEffect, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { getProduct } from '../../../services/api/products.js'
import ProductGallery from '../components/ProductGallery.jsx'
import ProductOverview from '../components/ProductOverview.jsx'
import ProductEditorial from '../components/ProductEditorial.jsx'

export default function ProductDetailPage({ id, navigate, onAddToCart }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    setLoading(true)
    setFailed(false)
    getProduct(id)
      .then((data) => {
        if (active) {
          setProduct(data)
          document.title = `${data.name} | نیکو سلامت`
        }
      })
      .catch(() => {
        if (active) setFailed(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])
  if (loading) return <main className="content-loading">در حال دریافت محصول…</main>
  if (failed || !product)
    return (
      <main className="not-found">
        <h1>محصول در دسترس نیست</h1>
        <p>لطفاً دوباره تلاش کنید یا به فهرست محصولات برگردید.</p>
        <a
          className="button primary"
          href="/products"
          onClick={(event) => navigate(event, '/products')}
        >
          همه محصولات
        </a>
      </main>
    )

  return (
    <main className="inner-page product-detail" id="top">
      <div className="section product-detail-shell">
        <nav className="product-breadcrumb" aria-label="مسیر صفحه">
          <a href="/" onClick={(event) => navigate(event, '/')}>
            خانه
          </a>
          <span>/</span>
          <a href="/products" onClick={(event) => navigate(event, '/products')}>
            محصولات
          </a>
          <span>/</span>
          <span>{product.name}</span>
        </nav>
        <section className="product-overview">
          <ProductGallery product={product} key={product.id} />

          <ProductOverview product={product} navigate={navigate} onAddToCart={onAddToCart} />
        </section>
        <ProductEditorial product={product} />
        <a className="view-all" href="/products" onClick={(event) => navigate(event, '/products')}>
          بازگشت به همه محصولات
          <Icon name="arrow" size={18} />
        </a>
      </div>
    </main>
  )
}
