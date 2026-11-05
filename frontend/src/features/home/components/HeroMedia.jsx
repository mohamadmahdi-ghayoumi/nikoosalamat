import React from 'react'

export default function HeroMedia({ slide, ready }) {
  return (
    <>
      <div
        className={`hero-image-placeholder ${slide.layout === 'poster' ? 'hero-image-placeholder--poster' : ''}`}
        style={{ backgroundImage: `url("${slide.preview}")` }}
        aria-hidden="true"
      />
      {ready &&
        (slide.scene ? (
          <svg
            className="hero-slide-media"
            viewBox={slide.scene.viewBox}
            preserveAspectRatio={slide.scene.align ?? 'xMidYMid slice'}
            role="img"
            aria-label={slide.alt}
          >
            <image href={slide.image} width={slide.scene.width} height={slide.scene.height} />
          </svg>
        ) : (
          <img
            className="hero-slide-media"
            src={slide.image}
            alt={slide.alt}
            width={slide.layout === 'poster' ? 1984 : undefined}
            height={slide.layout === 'poster' ? 793 : undefined}
            decoding="async"
          />
        ))}
    </>
  )
}
