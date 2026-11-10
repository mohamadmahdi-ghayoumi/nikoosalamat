import React from 'react'
import PageHeaderArtwork from './PageHeaderArtwork.jsx'

export default function PageHero({ eyebrow, title, description, artwork }) {
  return (
    <section className={`page-hero${artwork ? ' page-hero--illustrated' : ''}`}>
      {artwork ? <PageHeaderArtwork name={artwork} /> : <div className="page-hero-pattern" aria-hidden="true">
        ♞
      </div>}
      <div className="page-hero-inner">
        {eyebrow && <span className="eyebrow light">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}
