import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import PageHero from '../../../components/ui/PageHero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import useProductFilters from '../hooks/useProductFilters.js'

export default function ProductsPage({ products, navigate }) {
  const { query, setQuery, activeCategory, setActiveCategory, categories, visibleProducts } =
    useProductFilters(products)

  return (
    <main className="inner-page products-page" id="top">
      <PageHero
        title="حال نیکو سلامت"
        description="راهکار های تخصصی به منظور ارتقاء بهره وری دام پروری ، کشاورزی و پرورش اسب"
      />
      <section className="section catalog-section">
        <div className="catalog-toolbar">
          <div className="catalog-search">
            <Icon name="search" size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جست‌وجو میان محصولات..."
              aria-label="جست‌وجوی محصولات"
            />
          </div>
          <span>{new Intl.NumberFormat('fa-IR').format(visibleProducts.length)} محصول</span>
        </div>
        <div className="filter-tabs" aria-label="فیلتر دسته‌بندی">
          {categories.map((category) => (
            <button
              className={activeCategory === category ? 'active' : ''}
              onClick={() => setActiveCategory(category)}
              key={category}
            >
              {category}
            </button>
          ))}
        </div>
        {visibleProducts.length > 0 ? (
          <div className="product-grid catalog-grid">
            {visibleProducts.map((product) => (
              <ProductCard product={product} navigate={navigate} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Icon name="search" size={30} />
            <h2>محصولی پیدا نشد</h2>
            <p>عبارت دیگری را جست‌وجو کنید یا فیلتر را تغییر دهید.</p>
          </div>
        )}
      </section>
    </main>
  )
}
