import React from 'react'
import PageHero from '../../../components/ui/PageHero.jsx'
import ContactDetails from '../components/ContactDetails.jsx'
import ContactForm from '../components/ContactForm.jsx'
import FaqSection from '../components/FaqSection.jsx'
import { SiteSections } from '../../site/SiteConfig.jsx'

export default function ContactPage({ showNotice, navigate }) {
  return (
    <main className="inner-page" id="top">
      <SiteSections
        page="contact"
        navigate={navigate}
        builtins={{
          hero: (
            <PageHero
              artwork="contact"
              eyebrow="ارتباط با ما"
              title="با حال نیکو سلامت در تماس باشید"
              description="برای دریافت اطلاعات محصولات، استعلام قیمت، ثبت سفارش یا همکاری در توزیع با ما ارتباط بگیرید."
            />
          ),
          contact: (
            <section className="section contact-layout">
              <ContactDetails />
              <ContactForm showNotice={showNotice} />
            </section>
          ),
          faq: <FaqSection />,
        }}
      />
    </main>
  )
}
