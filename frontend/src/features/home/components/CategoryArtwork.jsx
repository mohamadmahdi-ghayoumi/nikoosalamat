import React from 'react'
import { categoryImages } from '../data/categoryImages.js'

export default function CategoryArtwork({ index }) {
  const art = categoryImages[index % categoryImages.length]
  return (
    <div className="category-photo" aria-hidden="true">
      {art.crop ? (
        <svg viewBox={art.crop} preserveAspectRatio="xMidYMid slice">
          <image href={art.image} width="1983" height="793" />
        </svg>
      ) : (
        <img src={art.image} alt="" loading="lazy" style={{ objectPosition: art.position }} />
      )}
    </div>
  )
}
