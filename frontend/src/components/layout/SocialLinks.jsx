import React from 'react'
import Icon from '../ui/Icon.jsx'
import { socialChannels } from '../../config/socials.js'
import { useSiteConfig } from '../../features/site/SiteConfig.jsx'

export default function SocialLinks({ placement }) {
  const { config } = useSiteConfig()
  return (
    <div
      className={`social-links social-links-${placement}`}
      role="group"
      aria-label="شبکه‌های اجتماعی نیکو سلامت"
    >
      {socialChannels.map(({ icon, label, href: defaultHref }) => {
        const href = config.links?.[`social.${icon}`] ?? defaultHref
        const content = (
          <>
            <Icon name={icon} size={23} />
            <span className="social-label">{label}</span>
          </>
        )
        return href ? (
          <a
            key={icon}
            className="social-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
          >
            {content}
          </a>
        ) : (
          <span key={icon} className="social-link" role="img" aria-label={label} title={label}>
            {content}
          </span>
        )
      })}
    </div>
  )
}
