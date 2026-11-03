import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import ProductCard from '../../products/components/ProductCard.jsx'

export default function FeaturedProducts({ products, navigate }) {
  return (
    <section className="section products-section" id="products">
      <div className="section-heading center-heading">
        <div>
          <span className="eyebrow">انتخاب تخصصی دامداران</span>
          <h2>
            محصولات <em>پیشنهادی</em>
          </h2>
        </div>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard product={product} navigate={navigate} key={product.id} />
        ))}
      </div>
      <button
        className="button outline products-cta"
        onClick={(event) => navigate(event, '/products')}
      >
        دیدن همه محصولات <Icon name="arrow" size={18} />
      </button>
    </section>
  )
}
