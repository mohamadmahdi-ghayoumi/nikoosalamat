import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { productSummary } from '../utils/products.js'

export default function ProductEditorial({ product, navigate }) {
  const catalog = product.catalog || {}
  const titles = {
    introduction: catalog.introduction_title || 'معرفی محصول',
    features: catalog.features_title || 'ویژگی‌ها و مشخصات',
    usage: catalog.usage_title || 'روش مصرف',
  }

  const features = catalog.features?.length
    ? catalog.features
    : [
        `گروه محصول: ${product.category}`,
        `نوع بسته‌بندی: ${{ bottle: 'بطری', spray: 'اسپری', tin: 'قوطی', jar: 'ظرف' }[product.shape] || product.shape}`,
      ]
  const description =
    catalog.description ||
    `${product.name} از مجموعه محصولات حال نیکو سلامت در گروه ${product.category} است. ${productSummary(product)}`
  const usage =
    catalog.usage ||
    'مقدار، دفعات و نحوه مصرف را از روی برچسب همین محصول بررسی کنید و مطابق دستورالعمل تولیدکننده و نظر دامپزشک اقدام کنید.'
  return (
    <>
      <nav className="product-section-links" aria-label="بخش‌های معرفی محصول">
        {Object.entries(titles).map(([section, title]) => (
          <a key={section} href={`#product-${section}`} onClick={(event) => navigate(event, `#product-${section}`)}>{title}</a>
        ))}
      </nav>
      <div className="product-editorial">
        <section id="product-introduction">
          <span className="eyebrow">{titles.introduction}</span>
          <h2>معرفی {product.name}</h2>
          <div className="product-rich-text">{description}</div>
        </section>
        <section id="product-features">
          <h2>{titles.features}</h2>
          <ul>
            {features.map((feature, index) => (
              <li key={index}>
                <Icon name="leaf" size={18} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>
        <section id="product-usage">
          <h2>{titles.usage}</h2>
          <div className="product-rich-text">{usage}</div>
        </section>
      </div>
    </>
  )
}
