import React from 'react'

const artworkNames = new Set(['about', 'contact', 'products', 'solutions', 'articles'])

// These illustrations are decorative; the real title remains selectable HTML.
export default function PageHeaderArtwork({ name }) {
  if (!artworkNames.has(name)) return null
  const prefix = `/images/page-headers/${name}`
  return <img
    className="page-header-artwork"
    src={`${prefix}-2000.webp`}
    srcSet={`${prefix}-480.webp 480w, ${prefix}-960.webp 960w, ${prefix}-2000.webp 2000w`}
    sizes="100vw"
    width="4025"
    height="1080"
    alt=""
    aria-hidden="true"
    decoding="async"
  />
}
