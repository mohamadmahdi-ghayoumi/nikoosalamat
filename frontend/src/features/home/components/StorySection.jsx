import { SiteText, useSiteConfig, siteMediaUrl } from '../../site/SiteConfig.jsx'
import React, { useEffect, useRef, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'

export default function StorySection({ navigate }) {
  const { config } = useSiteConfig()
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const [loadVideo, setLoadVideo] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadVideo(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!loadVideo) return
    const video = videoRef.current
    video.load()
    video.play().catch(() => {})
  }, [loadVideo])
  return (
    <section
      className="story-video-section"
      id="story"
      ref={sectionRef}
      aria-label="معرفی تصویری حال نیکو سلامت"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload={loadVideo ? 'metadata' : 'none'}
        poster={
          loadVideo
            ? siteMediaUrl(
                config.images?.['story.poster']?.url ??
                  '/images/slides/hns-introduction-panoramic.webp',
              )
            : undefined
        }
        aria-label="ویدیوی معرفی حال نیکو سلامت"
      >
        {loadVideo && (
          <source
            src={config.links?.['story.video'] ?? '/videos/hns-site-cover.mp4'}
            type="video/mp4"
          />
        )}
      </video>
      <a
        href="/about"
        onClick={(event) => navigate(event, '/about')}
        className="button story-video-link"
      >
        <SiteText field="copy.storysection.0">داستان ما را بخوانید </SiteText>
        <Icon name="arrow" size={18} />
      </a>
    </section>
  )
}
