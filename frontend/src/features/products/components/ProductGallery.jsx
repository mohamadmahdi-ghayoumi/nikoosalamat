import React, { useState } from 'react'
import { resolveMediaUrl } from '../../../services/api/client.js'
import ProductVisual from './ProductVisual.jsx'

export default function ProductGallery({ product }) {
  const [selected, setSelected] = useState(null)
  const catalog = product.catalog || {}
  const images = [...new Set([product.image_url, ...(catalog.gallery || [])].filter(Boolean))]
  const mainImage = selected || images[0]
  return (
    <div className="product-gallery">
      <div className="product-main-image">
        <ProductVisual product={{ ...product, image_url: mainImage }} />
      </div>
      {images.length > 1 && (
        <div className="product-thumbnails" aria-label="تصاویر محصول">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setSelected(image)}
              aria-label={`تصویر ${index + 1} محصول`}
              aria-pressed={mainImage === image}
            >
              <img src={resolveMediaUrl(image)} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
