import React from 'react'
import { categoryImages } from '../data/categoryImages.js'
import { SiteImage, SiteText } from '../../site/SiteConfig.jsx'

export default function CategoryArtwork({ index }) {
  const art = categoryImages[index % categoryImages.length]
  return (
    <span className="category-artwork">
      <SiteImage
        field={`category.${index % categoryImages.length}`}
        className="category-card-image"
        src={art.image}
        alt={art.alt}
        width="720"
        height="720"
        loading="lazy"
      />
      <span className="category-caption" id={`category-label-${index}`}>
        <SiteText field={`category.caption.${index % categoryImages.length}`}>{art.label}</SiteText>
      </span>
    </span>
  )
}
