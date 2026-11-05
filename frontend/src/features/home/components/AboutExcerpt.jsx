import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'

export default function AboutExcerpt({ navigate }) {
  return (
    <section className="home-about" aria-labelledby="home-about-title">
      <div className="home-about-inner">
        <div>
          <span className="eyebrow">درباره ما</span>
          <h2 id="home-about-title">حال نیکو سلامت و فارمیوکِر</h2>
        </div>
        <div className="home-about-copy">
          <p>
            ما به‌عنوان یک تولیدکننده ایرانی و توزیع‌کننده رسمی محصولات شرکت فارمیوکِر (PharmuCare)،
            مجموعه‌ای متنوع و پیشرفته از محصولات را ارائه می‌کنیم؛ از مراقبت‌های تخصصی سلامت
            اندام‌های حرکتی دام تا راه‌حل‌های بهداشت محیط دامداری…
          </p>
          <a
            className="button primary"
            href="/about#pharmucare"
            onClick={(event) => navigate(event, '/about#pharmucare')}
          >
            ادامه مطلب درباره ما <Icon name="arrow" size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}
