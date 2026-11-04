import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { categoryPageSlugs } from '../data/homeContent.js'
import CategoryArtwork from './CategoryArtwork.jsx'
import { categoryImages } from '../data/categoryImages.js'

export default function CategoryGrid({ categories, navigate }) {
  return (
    <section className="section categories-section" id="categories">
      <div className="section-heading">
        <div>
          <span className="eyebrow">از علم تا مزرعه، با حال نیکو سلامت</span>
          <h2>
            هر آنچه برای <em>سلامت دام</em> لازم است
          </h2>
        </div>
        <a className="view-all" href="/products" onClick={(event) => navigate(event, '/products')}>
          همه دسته‌بندی‌ها <Icon name="arrow" size={18} />
        </a>
      </div>
      <div className="category-grid">
        {categories.map((category, index) => (
          <a
            href={`/pages/${categoryPageSlugs[index]}`}
            onClick={(event) => navigate(event, `/pages/${categoryPageSlugs[index]}`)}
            className="category-card category-card--image"
            aria-label={categoryImages[index].alt.split('؛')[0]}
            key={category.name}
          >
            <CategoryArtwork index={index} />
            <h3 className="category-caption">{categoryImages[index].alt.split('؛')[0]}</h3>
          </a>
        ))}
      </div>
    </section>
  )
}
