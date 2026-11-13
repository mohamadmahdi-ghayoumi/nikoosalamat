import { SiteText } from '../../site/SiteConfig.jsx'
import React, { useEffect, useState } from 'react'
import { getFaqs } from '../../../services/api/faqs.js'

export default function FaqSection() {
  const [showAll, setShowAll] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getFaqs()
      .then((data) => {
        if (active) setItems(data)
      })
      .catch(() => {
        if (active) setError('دریافت سؤالات انجام نشد؛ دوباره تلاش کنید.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [retry])
  return (
    <section className="faq-section" id="faq">
      <div className="section faq-inner">
        <div className="section-heading center-heading">
          <div>
            <span className="eyebrow">
              <SiteText field="copy.faqsection.0">راهنمای محصولات و سفارش</SiteText>
            </span>
            <h2>
              <SiteText field="copy.faqsection.1">سؤالات </SiteText>
              <em>
                <SiteText field="copy.faqsection.2">متداول</SiteText>
              </em>
            </h2>
            <p>
              <SiteText field="copy.faqsection.3">
                پاسخ پرسش‌های رایج درباره محصولات، نحوه مصرف، سفارش و همکاری
              </SiteText>
            </p>
          </div>
        </div>
        <div className="faq-list" id="faq-list">
          {loading ? (
            <p role="status">
              <SiteText field="copy.faqsection.4">در حال دریافت سؤالات…</SiteText>
            </p>
          ) : error ? (
            <div role="alert">
              <p>{error}</p>
              <button className="button outline" onClick={() => setRetry((value) => value + 1)}>
                <SiteText field="copy.faqsection.6">تلاش دوباره</SiteText>
              </button>
            </div>
          ) : !items.length ? (
            <p>
              <SiteText field="copy.faqsection.8">
                هنوز سؤالی در این بخش منتشر نشده است؛ از فرم تماس برای ما پیام بفرستید.
              </SiteText>
            </p>
          ) : (
            (showAll ? items : items.slice(0, 5)).map(({ id, question, answer }, index) => (
              <details key={id} open={index === 0}>
                <summary>
                  {question}
                  <span className="faq-toggle" aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))
          )}
        </div>
        {!loading && !error && items.length > 5 && (
          <button
            className="button outline faq-more"
            type="button"
            aria-expanded={showAll}
            aria-controls="faq-list"
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? 'نمایش سؤالات کمتر' : 'سؤالات بیشتر'}
          </button>
        )}
      </div>
    </section>
  )
}
