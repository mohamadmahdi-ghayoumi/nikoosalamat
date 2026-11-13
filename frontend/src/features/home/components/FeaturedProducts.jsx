import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import ProductCard from '../../products/components/ProductCard.jsx'
import { EditableText } from './HomeTextEditor.jsx'
import { SiteText } from '../../site/SiteConfig.jsx'

export default function FeaturedProducts({ products, navigate }) {
  return (
    <section className="section products-section" id="products">
      <div className="section-heading center-heading">
        <div>
          <span className="eyebrow">
            <EditableText field="featured.eyebrow">انتخاب تخصصی برای نیاز شما</EditableText>
          </span>
          <h2>
            <EditableText field="featured.title">محصولات</EditableText>{' '}
            <em>
              <EditableText field="featured.highlight">پیشنهادی</EditableText>
            </em>
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
        <SiteText field="home.featured.action">دیدن همه محصولات</SiteText>{' '}
        <Icon name="arrow" size={18} />
      </button>
    </section>
  )
}
