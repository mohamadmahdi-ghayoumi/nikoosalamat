import React from 'react'
import { resolveMediaUrl } from '../../../services/api/client.js'

export default function ProductVisual({ product }) {
  if (product.image_url)
    return (
      <div className="product-visual uploaded">
        <img src={resolveMediaUrl(product.image_url)} alt={product.name} loading="lazy" />
      </div>
    )
  return (
    <div className={`product-visual ${product.tone}`}>
      <div className={`product-pack ${product.shape}`}>
        {product.shape === 'spray' && <span className="sprayer" />}
        <div className="mini-mark">نیکو سلامت</div>
        <div className="mini-horse">♞</div>
        <small>{product.category}</small>
      </div>
    </div>
  )
}
