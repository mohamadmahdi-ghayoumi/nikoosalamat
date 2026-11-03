import React from 'react'
import PageHero from '../../../components/ui/PageHero.jsx'
import ContactDetails from '../components/ContactDetails.jsx'
import ContactForm from '../components/ContactForm.jsx'
import FaqSection from '../components/FaqSection.jsx'

export default function ContactPage({ showNotice }) {
  return (
    <main className="inner-page" id="top">
      <PageHero
        eyebrow="ارتباط با ما"
        title="با حال نیکو سلامت در تماس باشید"
        description="برای دریافت اطلاعات محصولات، استعلام قیمت، ثبت سفارش یا همکاری در توزیع با ما ارتباط بگیرید."
      />
      <section className="section contact-layout">
        <ContactDetails />
        <ContactForm showNotice={showNotice} />
      </section>
      <FaqSection />
    </main>
  )
}
