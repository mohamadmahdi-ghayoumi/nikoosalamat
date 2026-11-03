import React from 'react'
import ProductVisual from '../../products/components/ProductVisual.jsx'
import { formatPrice } from '../../../utils/format.js'

export default function ProductList({ products, removeProduct, setEditingCatalog }) {
  return (
    <section className="admin-products">
      <div className="admin-list-head">
        <div>
          <span>فهرست محصولات</span>
          <h2>{new Intl.NumberFormat('fa-IR').format(products.length)} محصول</h2>
        </div>
      </div>
      <div className="admin-product-list">
        {products.map((product) => (
          <article key={product.id}>
            <ProductVisual product={product} />
            <div>
              <span>{product.category}</span>
              <h3>{product.name}</h3>
              <p>{formatPrice(product.price)} تومان</p>
            </div>
            <div className="admin-row-actions">
              <button onClick={() => setEditingCatalog(product)}>کاتالوگ</button>
              <button className="danger" onClick={() => removeProduct(product)}>
                حذف
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
