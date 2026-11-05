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

export default function HomePage({ homeData, navigate, showNotice, onApiOnline }) {
  const products = homeData?.featured_products ?? fallbackProducts
  const benefits = homeData?.benefits ?? fallbackBenefits
  return (
    <main id="top">
      <HeroSlider navigate={navigate} />
      <BenefitsBar benefits={benefits} />
      <CategoryGrid navigate={navigate} />
      <FeaturedProducts products={products} navigate={navigate} />
      <StorySection navigate={navigate} />
      <NewsletterSection showNotice={showNotice} onApiOnline={onApiOnline} />
      <AboutExcerpt navigate={navigate} />
    </main>
  )
}
