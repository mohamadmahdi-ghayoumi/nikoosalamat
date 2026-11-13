import React from 'react'

export default function HeroMedia({ slide, ready }) {
  return (
    <>
      <div
        className={`hero-image-placeholder ${slide.layout === 'poster' ? 'hero-image-placeholder--poster' : ''}`}
        style={{ backgroundImage: `url(${JSON.stringify(slide.preview)})` }}
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
            <image
              href={slide.image}
              width={slide.scene.width}
              height={slide.scene.height}
              preserveAspectRatio={slide.fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'}
            />
          </svg>
        ) : (
          <img
            className="hero-slide-media"
            src={slide.image}
            alt={slide.alt}
            width={slide.layout === 'poster' ? 1984 : undefined}
            height={slide.layout === 'poster' ? 793 : undefined}
            decoding="async"
            style={slide.fit ? { objectFit: slide.fit } : undefined}
          />
        ))}
    </>
  )
}
