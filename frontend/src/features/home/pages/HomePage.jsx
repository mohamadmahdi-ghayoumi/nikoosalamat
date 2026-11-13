import React from 'react'
import { fallbackBenefits } from '../data/homeContent.js'
import { fallbackProducts } from '../../products/data/defaultProducts.js'
import HeroSlider from '../components/HeroSlider.jsx'
import BenefitsBar from '../components/BenefitsBar.jsx'
import CategoryGrid from '../components/CategoryGrid.jsx'
import FeaturedProducts from '../components/FeaturedProducts.jsx'
import StorySection from '../components/StorySection.jsx'
import NewsletterSection from '../components/NewsletterSection.jsx'
import AboutExcerpt from '../components/AboutExcerpt.jsx'
import HomeTextEditor, { HomeEditingBar } from '../components/HomeTextEditor.jsx'
import { SiteSections } from '../../site/SiteConfig.jsx'

export default function HomePage({ homeData, navigate, showNotice, onApiOnline }) {
  const products = homeData?.featured_products ?? fallbackProducts
  const benefits = homeData?.benefits ?? fallbackBenefits
  return (
    <HomeTextEditor showNotice={showNotice}>
      <main id="top">
        <HomeEditingBar />
        <SiteSections
          page="home"
          navigate={navigate}
          builtins={{
            hero: <HeroSlider navigate={navigate} />,
            benefits: <BenefitsBar benefits={benefits} />,
            categories: <CategoryGrid navigate={navigate} />,
            products: <FeaturedProducts products={products} navigate={navigate} />,
            about: <AboutExcerpt navigate={navigate} />,
            story: <StorySection navigate={navigate} />,
            newsletter: <NewsletterSection showNotice={showNotice} onApiOnline={onApiOnline} />,
          }}
        />
      </main>
    </HomeTextEditor>
  )
}
