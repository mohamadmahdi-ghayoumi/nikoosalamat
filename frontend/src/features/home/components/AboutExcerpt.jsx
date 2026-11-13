import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import PharmucareBrand from '../../../components/ui/PharmucareBrand.jsx'
import { pharmucareContent } from '../../about/data/pharmucareContent.js'
import { EditableText } from './HomeTextEditor.jsx'
import { SiteText } from '../../site/SiteConfig.jsx'

export default function AboutExcerpt({ navigate }) {
  return (
    <section className="home-about" aria-labelledby="home-about-title">
      <div className="home-about-inner">
        <div className="home-about-copy">
          <span className="eyebrow">
            <EditableText field="about.eyebrow">{pharmucareContent.tagline}</EditableText>
          </span>
          <h2 id="home-about-title">
            <EditableText field="about.title">{pharmucareContent.title}</EditableText>
          </h2>
          <p>
            <EditableText field="about.description">
              {pharmucareContent.introduction.slice(0, 2).join(' ')}
            </EditableText>
          </p>
          <a
            className="button primary"
            href="/about#pharmucare"
            onClick={(event) => navigate(event, '/about#pharmucare')}
          >
            <SiteText field="home.about.action">ادامه مطلب درباره فارمیوکِر</SiteText>{' '}
            <Icon name="arrow" size={18} />
          </a>
        </div>
        <PharmucareBrand language="en" editable />
      </div>
    </section>
  )
}
