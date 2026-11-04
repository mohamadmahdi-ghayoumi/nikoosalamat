import React from 'react'
import SocialLinks from './SocialLinks.jsx'

export default function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-identity">
            <a
              href="/"
              onClick={(event) => navigate(event, '/')}
              className="brand"
              aria-label="صفحه اصلی حال نیکو سلامت"
            >
              <svg
                className="brand-logo footer-logo"
                viewBox="80 80 305 315"
                aria-hidden="true"
                focusable="false"
              >
                <image href="/images/hns-logo.png" width="461" height="526" />
              </svg>
            </a>
            <div>
              <strong>حال نیکو سلامت</strong>
              <p>از علم تا مزرعه، با حال نیک</p>
            </div>
          </div>
          <p>راهکارهای تخصصی برای سلامت پایدار دام.</p>
          <SocialLinks placement="footer" />
        </div>
        <div className="footer-group">
          <h3>راهکارها</h3>
          <a href="/pages/hoof-care" onClick={(event) => navigate(event, '/pages/hoof-care')}>
            مراقبت از سُم
          </a>
          <a href="/pages/udder-health" onClick={(event) => navigate(event, '/pages/udder-health')}>
            سلامت پستان
          </a>
          <a
            href="/pages/farm-disinfection"
            onClick={(event) => navigate(event, '/pages/farm-disinfection')}
          >
            ضدعفونی دامداری
          </a>
          <a
            href="/pages/animal-hygiene"
            onClick={(event) => navigate(event, '/pages/animal-hygiene')}
          >
            بهداشت دام و اسب
          </a>
        </div>
        <div className="footer-group">
          <h3>راهنما</h3>
          <a href="/about" onClick={(event) => navigate(event, '/about')}>
            درباره نیکو سلامت
          </a>
          <a href="/articles" onClick={(event) => navigate(event, '/articles')}>
            مجله نیکو سلامت
          </a>
          <a href="/contact#faq" onClick={(event) => navigate(event, '/contact#faq')}>
            پرسش‌های متداول
          </a>
          <a href="/contact" onClick={(event) => navigate(event, '/contact')}>
            ارسال و بازگشت سفارش
          </a>
        </div>
        <div className="footer-group footer-contact">
          <h3>ارتباط با ما</h3>
          <a href="tel:+989124283834">۰۹۱۲۴۲۸۳۸۳۴</a>
          <a href="mailto:info@nikoosalamat.ir">info@nikoosalamat.ir</a>
          <span>شهر قدس، کوی صنعت، پلاک ۵</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© ۱۴۰۵ نیکو سلامت؛ همه حقوق محفوظ است.</span>
        <span>با احترام به دام، دامدار و طبیعت</span>
      </div>
    </footer>
  )
}
