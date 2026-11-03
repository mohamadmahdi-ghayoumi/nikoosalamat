import React from 'react'
import { categoryImages } from '../data/categoryImages.js'

export default function CategoryArtwork({ index }) {
  const art = categoryImages[index % categoryImages.length]
  return (
    <img
      className="category-card-image"
      src={art.image}
      alt={art.alt}
      width="917"
      height="917"
      loading="lazy"
    />
  )
}
