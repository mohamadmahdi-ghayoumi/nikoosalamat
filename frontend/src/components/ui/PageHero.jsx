import React from 'react'

export default function PageHero({ eyebrow, title, description }) {
  return (
    <section className="page-hero">
      <div className="page-hero-pattern" aria-hidden="true">
        ♞
      </div>
      <div className="page-hero-inner">
        <span className="eyebrow light">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}
