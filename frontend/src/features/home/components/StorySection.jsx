import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'

export default function StorySection({ navigate }) {
  return (
    <section className="story-video-section" id="story" aria-label="معرفی تصویری حال نیکو سلامت">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="ویدیوی معرفی حال نیکو سلامت"
      >
        <source src="/videos/hns-site-cover.mp4" type="video/mp4" />
      </video>
      <a
        href="/about"
        onClick={(event) => navigate(event, '/about')}
        className="button story-video-link"
      >
        داستان ما را بخوانید <Icon name="arrow" size={18} />
      </a>
    </section>
  )
}
