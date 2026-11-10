import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import PharmucareBrand from '../../../components/ui/PharmucareBrand.jsx'
import { pharmucareContent } from '../../about/data/pharmucareContent.js'

export default function AboutExcerpt({ navigate }) {
  return (
    <section className="home-about" aria-labelledby="home-about-title">
      <div className="home-about-inner">
        <div className="home-about-copy">
          <span className="eyebrow">{pharmucareContent.tagline}</span>
          <h2 id="home-about-title">{pharmucareContent.title}</h2>
          <p>{pharmucareContent.introduction.slice(0, 2).join(' ')}</p>
          <a
            className="button primary"
            href="/about#pharmucare"
            onClick={(event) => navigate(event, '/about#pharmucare')}
          >
            ادامه مطلب درباره فارمیوکِر <Icon name="arrow" size={18} />
          </a>
        </div>
        <PharmucareBrand language="en" />
      </div>
    </section>
  )
}
