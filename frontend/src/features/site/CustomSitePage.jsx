import React from 'react'
import PageHero from '../../components/ui/PageHero.jsx'
import { SiteSections } from './SiteConfig.jsx'

export default function CustomSitePage({ page, navigate }) {
  return (
    <main className="inner-page" id="top">
      <PageHero title={page.title} description={page.description || ''} />
      <SiteSections page="custom" navigate={navigate} sections={page.sections} />
    </main>
  )
}
