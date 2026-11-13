import React from 'react'
import PageHeaderArtwork from './PageHeaderArtwork.jsx'
import { SiteText, useSiteConfig, siteMediaUrl } from '../../features/site/SiteConfig.jsx'

export default function PageHero({ eyebrow, title, description, artwork }) {
  const { config } = useSiteConfig()
  const prefix = artwork || window.location.pathname.split('/')[1] || 'home'
  const cover = config.images?.[`page.${prefix}.cover`]
  return (
    <section className={`page-hero${artwork ? ' page-hero--illustrated' : ''}`}>
      {cover ? (
        <img
          className="cms-page-cover"
          src={siteMediaUrl(cover.url)}
          alt={cover.alt || ''}
          style={{ objectFit: cover.fit || 'cover' }}
        />
      ) : artwork ? (
        <PageHeaderArtwork name={artwork} />
      ) : (
        <div className="page-hero-pattern" aria-hidden="true">
          ♞
        </div>
      )}
      <div className="page-hero-inner">
        {eyebrow && (
          <span className="eyebrow light">
            <SiteText field={`page.${prefix}.eyebrow`}>{eyebrow}</SiteText>
          </span>
        )}
        <h1>
          <SiteText field={`page.${prefix}.title`}>{title}</SiteText>
        </h1>
        <p>
          <SiteText field={`page.${prefix}.description`}>{description}</SiteText>
        </p>
      </div>
    </section>
  )
}
