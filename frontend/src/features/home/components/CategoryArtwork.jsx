import React from 'react'
import { categoryImages } from '../data/categoryImages.js'
import { SiteImage } from '../../site/SiteConfig.jsx'

export default function CategoryArtwork({ index }) {
  const art = categoryImages[index % categoryImages.length]
  return (
    <span className="category-artwork">
      <SiteImage
        field={`category.${index % categoryImages.length}`}
        className="category-card-image"
        src={art.image}
        alt={art.alt}
        width="917"
        height="917"
        loading="lazy"
      />
    </span>
  )
}
