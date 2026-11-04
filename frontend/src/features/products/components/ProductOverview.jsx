import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { productSummary } from '../utils/products.js'

export default function ProductOverview({ product, navigate }) {
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
        <a
          className="button primary"
          href="/contact#contact-form"
          onClick={(event) => navigate(event, '/contact#contact-form')}
        >
          استعلام قیمت و سفارش
          <Icon name="phone" size={18} />
        </a>
        <a
          className="button outline"
          href="/contact#sales"
          onClick={(event) => navigate(event, '/contact#sales')}
        >
          مشاوره درباره محصول
        </a>
      </div>
    </div>
  )
}
