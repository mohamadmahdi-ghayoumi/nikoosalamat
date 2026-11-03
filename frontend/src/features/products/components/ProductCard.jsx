import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import ProductVisual from './ProductVisual.jsx'
import { productPath, productSummary } from '../utils/products.js'

export default function ProductCard({ product, navigate }) {
  const path = productPath(product)
  return (
    <article className="product-card catalog-product-card">
      <a
        className="product-art-wrap"
        href={path}
        onClick={(event) => navigate(event, path)}
        aria-label={`مشاهده ${product.name}`}
      >
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <ProductVisual product={product} />
      </a>
      <div className="product-info">
        <span>{product.category}</span>
        <h3>
          <a href={path} onClick={(event) => navigate(event, path)}>
            {product.name}
          </a>
        </h3>
        <p className="product-summary">{productSummary(product)}</p>
        <div className="product-price">
          <strong>{new Intl.NumberFormat('fa-IR').format(product.price)}</strong>
          <span>تومان</span>
        </div>
        <a className="button product-view" href={path} onClick={(event) => navigate(event, path)}>
          مشاهده محصول
          <Icon name="arrow" size={17} />
        </a>
      </div>
    </article>
  )
}
