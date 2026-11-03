import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { productSummary } from '../utils/products.js'

export default function ProductOverview({ product, navigate, onAddToCart }) {
  return (
    <div className="product-overview-copy">
      <span className="eyebrow">{product.category}</span>
      <h1>{product.name}</h1>
      <p className="product-intro">{productSummary(product)}</p>
      <dl className="product-specs">
        <div>
          <dt>دسته‌بندی</dt>
          <dd>{product.category}</dd>
        </div>
        <div>
          <dt>نوع بسته‌بندی</dt>
          <dd>
            {{ bottle: 'بطری', spray: 'اسپری', tin: 'قوطی', jar: 'ظرف' }[product.shape] ||
              product.shape}
          </dd>
        </div>
      </dl>
      <div className="product-detail-price">
        <strong>{new Intl.NumberFormat('fa-IR').format(product.price)}</strong>
        <span>تومان</span>
      </div>
      <div className="product-detail-actions">
        <button className="button primary" onClick={() => onAddToCart(product)}>
          افزودن به سبد خرید
          <Icon name="bag" size={18} />
        </button>
        <a
          className="button outline"
          href="/contact"
          onClick={(event) => navigate(event, '/contact')}
        >
          مشاوره درباره محصول
        </a>
      </div>
    </div>
  )
}
