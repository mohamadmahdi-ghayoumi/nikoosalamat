import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import PageHero from '../../../components/ui/PageHero.jsx'
import PharmucareBrand from '../../../components/ui/PharmucareBrand.jsx'
import { pharmucareContent } from '../data/pharmucareContent.js'

export default function AboutPage({ navigate }) {
  const values = [
    {
      id: 'livestock',
      image: '/images/about-fields/livestock.png',
      imageWidth: 494,
      title: 'دامپروری',
      text: 'راهکارهای تخصصی برای ارتقای سلامت و بهداشت دام و افزایش بهره‌وری پایدار دامداری.',
    },
    {
      id: 'horses',
      image: '/images/about-fields/horses.png',
      imageWidth: 492,
      title: 'پرورش اسب',
      text: 'محصولات و راهکارهای مراقبتی متناسب با نیازهای سلامت و بهداشت اسب.',
    },
    {
      id: 'agriculture',
      image: '/images/about-fields/agriculture.png',
      imageWidth: 496,
      title: 'کشاورزی',
      text: 'راهکارهای نوین برای رشد مطلوب گیاهان و کمک به توسعه پایدار کشاورزی.',
    },
    {
      id: 'human',
      image: '/images/about-fields/human.png',
      imageWidth: 491,
      title: 'انسانی',
      text: 'برای آشنایی با فعالیت‌های حوزه انسانی، با کارشناسان حال نیکو سلامت در ارتباط باشید.',
    },
  ]

  return (
    <main className="inner-page" id="top">
      <PageHero
        artwork="about"
        eyebrow="درباره شرکت حال نیکو سلامت"
        title="همراه سلامت و بهره‌وری، از علم تا مزرعه"
        description="توسعه راهکارهای تخصصی برای دامپروری، پرورش اسب، کشاورزی و حوزه انسانی با تکیه بر دانش، تجربه و تعهد."
      />
      <section className="section about-intro" id="company">
        <div className="about-copy">
          <span className="eyebrow">معرفی شرکت</span>
          <h2>راهکارهای نوین برای سلامت و رشد پایدار</h2>
          <p>
            در شرکت حال نیکو سلامت، هدف ما روشن است: ارتقای بهداشت و سلامت در چهار حوزه دامپروری،
            پرورش اسب، کشاورزی و انسانی. با بیش از سه سال تلاش پیوسته و بهره‌گیری از دانش و تجربه
            متخصصان این حوزه، موفق به توسعه فرمولاسیون‌های نوین و منطبق با استانداردهای جهانی
            شده‌ایم.
          </p>
          <p>
            ما همواره در کنار شما هستیم تا بهترین راهکارها و محصولات تخصصی را متناسب با نیازهای این
            چهار حوزه در اختیارتان قرار دهیم.
          </p>
          <button className="button primary" onClick={(event) => navigate(event, '/contact')}>
            ارتباط با حال نیکو سلامت <Icon name="arrow" size={18} />
          </button>
        </div>
        <div className="about-visual">
          <div className="about-image" role="img" aria-label="دام سالم در محیط دامداری" />
        </div>
      </section>
      <section
        className="section pharmucare-section"
        id="pharmucare"
        aria-labelledby="pharmucare-title"
      >
        <div className="pharmucare-intro">
          <div className="about-copy">
            <span className="eyebrow">{pharmucareContent.tagline}</span>
            <h2 id="pharmucare-title">{pharmucareContent.title}</h2>
            {pharmucareContent.introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <a
              className="button primary"
              href="/products"
              onClick={(event) => navigate(event, '/products')}
            >
              مشاهده محصولات <Icon name="arrow" size={18} />
            </a>
          </div>
          <PharmucareBrand language="en" />
          <div className="pharmucare-principles">
            <h3>{pharmucareContent.principlesTitle}</h3>
            <ul>
              {pharmucareContent.principles.map((principle) => (
                <li key={principle.title}>
                  <strong>{principle.title}</strong>
                  <span>{principle.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="values-section" id="fields">
        <div className="section values-inner">
          <div className="section-heading center-heading">
            <div>
              <span className="eyebrow light">حوزه‌های فعالیت</span>
              <h2>
                چهار مسیر، یک <em>تعهد</em>
              </h2>
            </div>
          </div>
          <div className="values-grid">
            {values.map((value) => (
              <article key={value.title} id={value.id} aria-labelledby={`about-field-${value.id}`}>
                <div className="about-field-artwork">
                  <img
                    src={value.image}
                    alt=""
                    width={value.imageWidth}
                    height="471"
                    loading="lazy"
                    decoding="async"
                  />
                  <h3 id={`about-field-${value.id}`}>{value.title}</h3>
                </div>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="certificates">
        <div className="about-copy">
          <span className="eyebrow">گواهینامه ها و افتخارات</span>
          <h2>گواهینامه ها و افتخارات حال نیکو سلامت</h2>
          <p>برای دریافت اطلاعات گواهینامه‌ها و افتخارات شرکت، با ما در ارتباط باشید.</p>
          <a
            className="button primary"
            href="/contact"
            onClick={(event) => navigate(event, '/contact')}
          >
            ارتباط با ما <Icon name="arrow" size={18} />
          </a>
        </div>
      </section>
      <section className="section about-stats">
        <div>
          <strong>+۳ سال</strong>
          <span>تلاش و توسعه</span>
        </div>
        <i />
        <div>
          <strong>۴</strong>
          <span>حوزه تخصصی</span>
        </div>
        <i />
        <div>
          <strong>ایران</strong>
          <span>تولیدکننده ایرانی</span>
        </div>
        <i />
        <div>
          <strong>PharmuCare</strong>
          <span>توزیع‌کننده رسمی</span>
        </div>
      </section>
    </main>
  )
}
