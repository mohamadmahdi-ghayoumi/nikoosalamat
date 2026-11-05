import React, { useEffect, useRef, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import CategoryArtwork from './CategoryArtwork.jsx'
import { categoryImages } from '../data/categoryImages.js'

export default function CategoryGrid({ navigate }) {
  const [position, setPosition] = useState(0)
  const [paused, setPaused] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [inView, setInView] = useState(false)
  const [visible, setVisible] = useState(!document.hidden)
  const [visibleCount, setVisibleCount] = useState(() =>
    window.matchMedia('(max-width: 960px)').matches ? 2 : 4,
  )
  const sectionRef = useRef(null)
  const count = categoryImages.length
  const playing = !paused && !hovered && !focused && inView && visible

  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)')
    const onResize = () => setVisibleCount(media.matches ? 2 : 4)
    const onVisibility = () => setVisible(!document.hidden)
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    })
    observer.observe(sectionRef.current)
    media.addEventListener('change', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(
      () => setPosition((current) => Math.min(current + 1, count)),
      4000,
    )
    return () => window.clearInterval(timer)
  }, [playing, count])

  return (
    <section
      className="section categories-section category-carousel"
      id="categories"
      ref={sectionRef}
      aria-label="دسته‌بندی محصولات"
      aria-roledescription="اسلایدر"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">از علم تا مزرعه، با حال نیکو سلامت</span>
          <h2>
            هر آنچه برای <em>سلامت دام</em> لازم است
          </h2>
        </div>
        <a className="view-all" href="/products" onClick={(event) => navigate(event, '/products')}>
          همه دسته‌بندی‌ها <Icon name="arrow" size={18} />
        </a>
      </div>
      <div className="category-carousel-viewport">
        <div
          className={`category-carousel-track ${position === 0 ? 'is-reset' : ''}`}
          style={{ '--category-offset': position, '--category-visible': visibleCount }}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && position === count) setPosition(0)
          }}
        >
          {[...categoryImages, ...categoryImages].map((category, index) => (
            <a
              href={category.path}
              onClick={(event) => navigate(event, category.path)}
              className="category-card category-card--image"
              aria-label={category.alt.split('؛')[0]}
              aria-hidden={index < position || index >= position + visibleCount}
              inert={index < position || index >= position + visibleCount}
              key={`${category.image}-${index}`}
            >
              <CategoryArtwork index={index} />
            </a>
          ))}
        </div>
      </div>
      <div className="category-carousel-controls">
        <button
          type="button"
          className="icon-button"
          aria-label="دسته‌های قبلی"
          onClick={() => setPosition((current) => (current - 1 + count) % count)}
        >
          <Icon name="chevron" size={18} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={paused ? 'پخش خودکار دسته‌بندی‌ها' : 'توقف پخش خودکار دسته‌بندی‌ها'}
          aria-pressed={paused}
          onClick={() => setPaused((current) => !current)}
        >
          <Icon name={paused ? 'play' : 'pause'} size={18} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="دسته‌های بعدی"
          onClick={() => setPosition((current) => Math.min(current + 1, count))}
        >
          <Icon name="chevron" size={18} />
        </button>
      </div>
    </section>
  )
}
