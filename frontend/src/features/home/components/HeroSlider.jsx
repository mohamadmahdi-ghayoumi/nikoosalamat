import React, { useEffect, useMemo, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { heroSlides } from '../data/heroSlides.js'
import useSlidePlayback from '../hooks/useSlidePlayback.js'
import useHeroImages from '../hooks/useHeroImages.js'
import HeroMedia from './HeroMedia.jsx'
import { EditableText, useHomeTextDialogOpen } from './HomeTextEditor.jsx'
import { useSiteConfig, siteMediaUrl, SiteText } from '../../site/SiteConfig.jsx'

export default function HeroSlider({ navigate }) {
  const { config } = useSiteConfig()
  const custom = config.slides !== undefined
  const slides = useMemo(() => {
    if (custom)
      return config.slides
        .filter((slide) => slide.enabled !== false)
        .map((slide) => ({
          ...slide,
          image: siteMediaUrl(slide.image),
          preview: siteMediaUrl(slide.image),
          scene:
            slide.layout === 'panoramic'
              ? { viewBox: '0 0 2400 960', width: 2400, height: 960, align: 'xMidYMid slice' }
              : undefined,
        }))
    return heroSlides.map((slide, index) =>
      config.images?.[`hero.${index}`]
        ? {
            ...slide,
            image: siteMediaUrl(config.images[`hero.${index}`].url),
            preview: siteMediaUrl(config.images[`hero.${index}`].url),
            alt: config.images[`hero.${index}`].alt ?? slide.alt,
            fit: config.images[`hero.${index}`].fit,
          }
        : slide,
    )
  }, [config.slides, config.images, custom])
  return slides.length ? (
    <HeroPlayback
      key={JSON.stringify(slides)}
      heroSlides={slides}
      custom={custom}
      navigate={navigate}
    />
  ) : null
}

function HeroPlayback({ navigate, heroSlides, custom }) {
  const editingText = useHomeTextDialogOpen()
  const [paused, setPaused] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(!document.hidden)
  const playing = !paused && !hovered && !focused && visible && !editingText
  const { statuses, requestImage } = useHeroImages(heroSlides)
  const readySlides = useMemo(() => statuses.map((status) => status === 'ready'), [statuses])
  const { active, select, move, progressRef } = useSlidePlayback({
    slideCount: heroSlides.length,
    playing,
    readySlides,
  })
  useEffect(() => {
    requestImage(active, false, 'high')
    requestImage((active + 1) % heroSlides.length)
  }, [active, requestImage])
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  return (
    <section
      className={`hero-slider ${['panoramic', 'poster'].includes(heroSlides[active].layout) ? 'hero-slider--panoramic' : ''}`}
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
        if (event.target.closest('.home-edit-pencil')) return
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
      <div
        className="hero-progress"
        aria-hidden="true"
        data-playing={playing && readySlides[active]}
      >
        <span className="hero-progress-fill" ref={progressRef} />
      </div>
      <div className="hero-slides" aria-live={paused ? 'polite' : 'off'}>
        {heroSlides.map((slide, index) => (
          <div
            className={`hero-slide ${slide.layout === 'panoramic' ? 'hero-slide--panoramic' : ''} ${slide.layout === 'poster' ? 'hero-slide--poster' : ''} ${slide.singleLineTitle ? 'hero-slide--single-line-title' : ''} ${active === index ? 'is-active' : ''}`}
            key={slide.image}
            role="group"
            aria-roledescription="اسلاید"
            aria-label={`${index + 1} از ${heroSlides.length}`}
            aria-hidden={active !== index}
            data-image-status={statuses[index]}
            inert={active !== index ? true : undefined}
          >
            <div className="hero-copy">
              <h1>
                {custom || slide.layout === 'poster' ? (
                  slide.title
                ) : (
                  <EditableText field={`hero.${index}.title`}>{slide.title}</EditableText>
                )}
              </h1>
              <p>
                {custom || slide.layout === 'poster' ? (
                  slide.text
                ) : (
                  <EditableText field={`hero.${index}.text`}>{slide.text}</EditableText>
                )}
              </p>
              <a
                className="button primary"
                href={slide.path}
                onClick={(event) => navigate(event, slide.path)}
              >
                {custom ? (
                  slide.action
                ) : (
                  <SiteText field={`home.hero.${index}.action`}>{slide.action}</SiteText>
                )}
                <Icon name="arrow" size={18} />
              </a>
            </div>
            {slide.layout === 'poster' ? (
              <a
                className="hero-poster-slide-link"
                href={slide.path}
                onClick={(event) => navigate(event, slide.path)}
                aria-label="درباره حال نیکو سلامت و فارمیوکِر بیشتر بخوانید"
              >
                <HeroMedia slide={slide} ready={readySlides[index]} />
              </a>
            ) : (
              <div className="hero-scene">
                <HeroMedia slide={slide} ready={readySlides[index]} />
              </div>
            )}
            {slide.layout === 'poster' && (
              <a
                className="button primary hero-poster-cta"
                href={slide.path}
                onClick={(event) => navigate(event, slide.path)}
              >
                {custom ? (
                  slide.action
                ) : (
                  <SiteText field={`home.hero.${index}.action`}>درباره ما</SiteText>
                )}{' '}
                <Icon name="arrow" size={18} />
              </a>
            )}
          </div>
        ))}
      </div>
      {!readySlides[active] && (
        <div className="hero-loading-state" role="status" aria-live="polite">
          {statuses[active] === 'error' ? (
            <>
              <span>تصویر بارگذاری نشد</span>
              <button type="button" onClick={() => requestImage(active, true, 'high')}>
                تلاش دوباره
              </button>
            </>
          ) : (
            <>
              <span className="hero-loading-spinner" aria-hidden="true" /> در حال آماده‌سازی تصویر…
            </>
          )}
        </div>
      )}
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
