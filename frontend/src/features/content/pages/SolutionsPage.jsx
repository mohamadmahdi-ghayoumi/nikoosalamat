import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import PageHero from '../../../components/ui/PageHero.jsx'
import { solutionItems } from '../../../config/solutions.js'

export default function SolutionsPage({ navigate }) {
  return (
    <main className="inner-page" id="top">
      <PageHero
        eyebrow="از علم تا مزرعه"
        title="راهکارهای مراقبت از سلامت دام"
        description="موضوع موردنظر را انتخاب کنید تا به معرفی راهکارها و اطلاعات مرتبط برسید."
      />
      <section className="section solutions-grid" aria-label="موضوعات راهکارها">
        {solutionItems.map((item) => (
          <a
            className="solution-card"
            key={item.path}
            href={item.path}
            onClick={(event) => navigate(event, item.path)}
          >
            <span className="benefit-icon">
              <Icon name={item.icon} />
            </span>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            <span className="solution-action">
              مطالعه بیشتر <Icon name="arrow" size={18} />
            </span>
          </a>
        ))}
      </section>
    </main>
  )
}
