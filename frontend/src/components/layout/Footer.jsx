import {
  SiteText,
  SiteImage,
  useSiteConfig,
  siteLink,
  FooterLinks,
} from '../../features/site/SiteConfig.jsx'
import React from 'react'

export default function Footer({ navigate }) {
  const { config } = useSiteConfig()
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-identity">
            <a
              href="/"
              onClick={(event) => navigate(event, '/')}
              className="brand footer-brand-link"
              aria-label="صفحه اصلی حال نیکو سلامت"
            >
              {config.images?.['brand.logo'] ? (
                <SiteImage
                  field="brand.logo"
                  className="brand-logo footer-logo"
                  src="/images/hns-logo.png"
                  alt=""
                />
              ) : (
                <svg
                  className="brand-logo footer-logo"
                  viewBox="80 80 305 315"
                  aria-hidden="true"
                  focusable="false"
                >
                  <image href="/images/hns-logo.png" width="461" height="526" />
                </svg>
              )}
              <span className="footer-brand-name">
                <SiteText field="copy.footer.0">حال نیکو سلامت</SiteText>
              </span>
            </a>
            <p className="footer-tagline">
              <SiteText field="copy.footer.1">از علم تا مزرعه، با حالِ نیک</SiteText>
            </p>
          </div>
        </div>
        <div className="footer-group">
          <h3>
            <SiteText field="copy.footer.2">راهکارها</SiteText>
          </h3>
          <FooterLinks name="solutions" navigate={navigate}>
            <a href="/pages/hoof-care" onClick={(event) => navigate(event, '/pages/hoof-care')}>
              <SiteText field="copy.footer.3">مراقبت از سُم</SiteText>
            </a>
            <a
              href="/pages/udder-health"
              onClick={(event) => navigate(event, '/pages/udder-health')}
            >
              <SiteText field="copy.footer.4">سلامت پستان</SiteText>
            </a>
            <a
              href="/pages/farm-disinfection"
              onClick={(event) => navigate(event, '/pages/farm-disinfection')}
            >
              <SiteText field="copy.footer.5">ضدعفونی دامداری</SiteText>
            </a>
            <a
              href="/pages/animal-hygiene"
              onClick={(event) => navigate(event, '/pages/animal-hygiene')}
            >
              <SiteText field="copy.footer.6">بهداشت دام و اسب</SiteText>
            </a>
          </FooterLinks>
        </div>
        <div className="footer-group">
          <h3>
            <SiteText field="copy.footer.7">راهنما</SiteText>
          </h3>
          <FooterLinks name="guide" navigate={navigate}>
            <a href="/about" onClick={(event) => navigate(event, '/about')}>
              <SiteText field="copy.footer.8">درباره نیکو سلامت</SiteText>
            </a>
            <a href="/mag/" onClick={(event) => navigate(event, '/mag/')}>
              <SiteText field="copy.footer.9">مجله نیکو سلامت</SiteText>
            </a>
            <a href="/contact#faq" onClick={(event) => navigate(event, '/contact#faq')}>
              <SiteText field="copy.footer.10">پرسش‌های متداول</SiteText>
            </a>
            <a href="/contact" onClick={(event) => navigate(event, '/contact')}>
              <SiteText field="copy.footer.11">ثبت و پیگیری سفارش</SiteText>
            </a>
          </FooterLinks>
        </div>
        <div className="footer-group footer-contact">
          <h3>
            <SiteText field="copy.footer.12">ارتباط با ما</SiteText>
          </h3>
          <a href={siteLink(config, 'contact.phone', 'tel:+989124283834')}>
            <SiteText field="copy.footer.13">مدیر فروش: </SiteText>
            <bdi>
              <SiteText field="copy.footer.14">۰۹۱۲۴۲۸۳۸۳۴</SiteText>
            </bdi>
          </a>
          <a href={siteLink(config, 'contact.email', 'mailto:info@nikoosalamat.ir')}>
            <SiteText field="copy.footer.15">info@nikoosalamat.ir</SiteText>
          </a>
          <span>
            <SiteText field="copy.footer.16">شهر قدس، کوی صنعت، پلاک ۵</SiteText>
          </span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          <SiteText field="copy.footer.17">© ۱۴۰۵ نیکو سلامت؛ همه حقوق محفوظ است.</SiteText>
        </span>
        <span>
          <SiteText field="copy.footer.18">با احترام به دام، دامدار و طبیعت</SiteText>
        </span>
      </div>
    </footer>
  )
}
