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
            <span className="eyebrow">راهنمای محصولات و سفارش</span>
            <h2>
              سؤالات <em>متداول</em>
            </h2>
            <p>پاسخ پرسش‌های رایج درباره محصولات، نحوه مصرف، سفارش و همکاری</p>
          </div>
        </div>
        <div className="faq-list" id="faq-list">
          {loading ? (
            <p role="status">در حال دریافت سؤالات…</p>
          ) : error ? (
            <div role="alert">
              <p>{error}</p>
              <button className="button outline" onClick={() => setRetry((value) => value + 1)}>
                تلاش دوباره
              </button>
            </div>
          ) : !items.length ? (
            <p>هنوز سؤالی در این بخش منتشر نشده است؛ از فرم تماس برای ما پیام بفرستید.</p>
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
