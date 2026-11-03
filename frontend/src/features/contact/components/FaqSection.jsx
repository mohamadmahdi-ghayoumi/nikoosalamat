import React from 'react'
import { faqItems } from '../data/faq.js'

export default function FaqSection() {
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
        <div className="faq-list">
          {faqItems.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
