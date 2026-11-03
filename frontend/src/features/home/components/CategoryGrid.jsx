import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { categoryPageSlugs } from '../data/homeContent.js'
import CategoryArtwork from './CategoryArtwork.jsx'

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
            key={category.name}
          >
            <CategoryArtwork index={index} />
          </a>
        ))}
      </div>
    </section>
  )
}
