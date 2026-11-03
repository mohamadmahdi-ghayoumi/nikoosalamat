import React, { useEffect, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { heroSlides } from '../data/heroSlides.js'
import useSlidePlayback from '../hooks/useSlidePlayback.js'

export default function HeroSlider({ navigate }) {
  const [paused, setPaused] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(!document.hidden)
  const playing = !paused && !hovered && !focused && visible
  const { active, select, move, progressRef } = useSlidePlayback({
    slideCount: heroSlides.length,
    playing,
  })
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  return (
    <section
      className="hero-slider"
      role="region"
      aria-roledescription="اسلایدر"
      aria-label="معرفی حال نیکو سلامت"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          move(1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          move(-1)
        }
      }}
    >
      <div className="hero-progress" aria-hidden="true" data-playing={playing}>
        <span className="hero-progress-fill" ref={progressRef} />
      </div>
      <div className="hero-slides" aria-live={paused ? 'polite' : 'off'}>
        {heroSlides.map((slide, index) => (
          <div
            className={`hero-slide ${active === index ? 'is-active' : ''}`}
            key={slide.image}
            role="group"
            aria-roledescription="اسلاید"
            aria-label={`${index + 1} از ${heroSlides.length}`}
            aria-hidden={active !== index}
            inert={active !== index ? true : undefined}
          >
            <div className="hero-copy">
              <span className="eyebrow">{slide.eyebrow}</span>
              <h1>{slide.title}</h1>
              <p>{slide.text}</p>
              <a
                className="button primary"
                href={slide.path}
                onClick={(event) => navigate(event, slide.path)}
              >
                {slide.action}
                <Icon name="arrow" size={18} />
              </a>
            </div>
            <div
              className={`hero-scene ${slide.scene?.fit === 'contain' ? 'hero-scene--contain' : ''}`}
            >
              {slide.scene ? (
                <svg
                  viewBox={slide.scene.viewBox}
                  preserveAspectRatio={
                    slide.scene.fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'
                  }
                  role="img"
                  aria-label={slide.alt}
                >
                  <image href={slide.image} width={slide.scene.width} height={slide.scene.height} />
                </svg>
              ) : (
                <img src={slide.image} alt={slide.alt} loading={index === 0 ? 'eager' : 'lazy'} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="hero-controls">
        <button
          className="slider-arrow slider-previous"
          onClick={() => move(-1)}
          aria-label="اسلاید قبلی"
        >
          <Icon name="chevron" size={20} />
        </button>
        <div className="slider-dots">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.image}
              onClick={() => select(index)}
              aria-label={`نمایش اسلاید ${index + 1}`}
              aria-pressed={active === index}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          className="slider-arrow slider-next"
          onClick={() => move(1)}
          aria-label="اسلاید بعدی"
        >
          <Icon name="chevron" size={20} />
        </button>
        <button
          className="slider-play"
          aria-label={paused ? 'شروع پخش خودکار' : 'توقف پخش خودکار'}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m8 5 11 7-11 7Z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="3" />
            </svg>
          )}
        </button>
      </div>
    </section>
  )
}
