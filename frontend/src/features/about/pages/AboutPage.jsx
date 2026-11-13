import {
  SiteText,
  SiteSections,
  SiteImage,
  useSiteConfig,
  siteMediaUrl,
} from '../../site/SiteConfig.jsx'
import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import PageHero from '../../../components/ui/PageHero.jsx'
import PharmucareBrand from '../../../components/ui/PharmucareBrand.jsx'
import { pharmucareContent } from '../data/pharmucareContent.js'
import { aboutValues } from '../data/aboutValues.js'

export default function AboutPage({ navigate }) {
  const values = aboutValues
  const { config } = useSiteConfig()
  const photo = config.images?.['about.photo']

  return (
    <main className="inner-page" id="top">
      <SiteSections
        page="about"
        navigate={navigate}
        builtins={{
          hero: (
            <PageHero
              artwork="about"
              eyebrow="درباره شرکت حال نیکو سلامت"
              title="همراه سلامت و بهره‌وری، از علم تا مزرعه"
              description="توسعه راهکارهای تخصصی برای دامپروری، پرورش اسب، کشاورزی و حوزه انسانی با تکیه بر دانش، تجربه و تعهد."
            />
          ),
          company: (
            <section className="section about-intro" id="company">
              <div className="about-copy">
                <span className="eyebrow">
                  <SiteText field="copy.aboutpage.0">معرفی شرکت</SiteText>
                </span>
                <h2>
                  <SiteText field="copy.aboutpage.1">
                    راهکارهای نوین برای سلامت و رشد پایدار
                  </SiteText>
                </h2>
                <p>
                  <SiteText field="copy.aboutpage.2">
                    در شرکت حال نیکو سلامت، هدف ما روشن است: ارتقای بهداشت و سلامت در چهار حوزه
                    دامپروری، پرورش اسب، کشاورزی و انسانی. با بیش از سه سال تلاش پیوسته و بهره‌گیری
                    از دانش و تجربه متخصصان این حوزه، موفق به توسعه فرمولاسیون‌های نوین و منطبق با
                    استانداردهای جهانی شده‌ایم.
                  </SiteText>
                </p>
                <p>
                  <SiteText field="copy.aboutpage.3">
                    ما همواره در کنار شما هستیم تا بهترین راهکارها و محصولات تخصصی را متناسب با
                    نیازهای این چهار حوزه در اختیارتان قرار دهیم.
                  </SiteText>
                </p>
                <button className="button primary" onClick={(event) => navigate(event, '/contact')}>
                  <SiteText field="copy.aboutpage.4">ارتباط با حال نیکو سلامت </SiteText>
                  <Icon name="arrow" size={18} />
                </button>
              </div>
              <div className="about-visual">
                <div
                  className="about-image"
                  role="img"
                  aria-label={photo?.alt || 'دام سالم در محیط دامداری'}
                  style={
                    photo
                      ? {
                          backgroundImage: `url(${JSON.stringify(siteMediaUrl(photo.url))})`,
                          backgroundSize: photo.fit || 'cover',
                          backgroundRepeat: 'no-repeat',
                        }
                      : undefined
                  }
                />
              </div>
            </section>
          ),
          pharmucare: (
            <section
              className="section pharmucare-section"
              id="pharmucare"
              aria-labelledby="pharmucare-title"
            >
              <div className="pharmucare-intro">
                <div className="about-copy">
                  <span className="eyebrow">
                    <SiteText field="about.pharmucare.tagline">
                      {pharmucareContent.tagline}
                    </SiteText>
                  </span>
                  <h2 id="pharmucare-title">
                    <SiteText field="about.pharmucare.title">{pharmucareContent.title}</SiteText>
                  </h2>
                  {pharmucareContent.introduction.map((paragraph, index) => (
                    <p key={index}>
                      <SiteText field={`about.pharmucare.intro.${index}`}>{paragraph}</SiteText>
                    </p>
                  ))}
                  <a
                    className="button primary"
                    href="/products"
                    onClick={(event) => navigate(event, '/products')}
                  >
                    <SiteText field="copy.aboutpage.5">مشاهده محصولات </SiteText>
                    <Icon name="arrow" size={18} />
                  </a>
                </div>
                <PharmucareBrand language="en" />
                <div className="pharmucare-principles">
                  <h3>
                    <SiteText field="about.pharmucare.principlesTitle">
                      {pharmucareContent.principlesTitle}
                    </SiteText>
                  </h3>
                  <ul>
                    {pharmucareContent.principles.map((principle, index) => (
                      <li key={principle.title}>
                        <strong>
                          <SiteText field={`about.pharmucare.principle.${index}.title`}>
                            {principle.title}
                          </SiteText>
                        </strong>
                        <span>
                          <SiteText field={`about.pharmucare.principle.${index}.text`}>
                            {principle.text}
                          </SiteText>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ),
          fields: (
            <section className="values-section" id="fields">
              <div className="section values-inner">
                <div className="section-heading center-heading">
                  <div>
                    <span className="eyebrow light">
                      <SiteText field="copy.aboutpage.6">حوزه‌های فعالیت</SiteText>
                    </span>
                    <h2>
                      <SiteText field="copy.aboutpage.7">چهار مسیر، یک </SiteText>
                      <em>
                        <SiteText field="copy.aboutpage.8">تعهد</SiteText>
                      </em>
                    </h2>
                  </div>
                </div>
                <div className="values-grid">
                  {values.map((value) => (
                    <article
                      key={value.title}
                      id={value.id}
                      aria-labelledby={`about-field-${value.id}`}
                    >
                      <div className="about-field-artwork">
                        <SiteImage
                          field={`about.field.${value.id}`}
                          src={value.image}
                          alt=""
                          width={value.imageWidth}
                          height="471"
                          loading="lazy"
                          decoding="async"
                        />
                        <h3 id={`about-field-${value.id}`}>
                          <SiteText field={`about.field.${value.id}.title`}>{value.title}</SiteText>
                        </h3>
                      </div>
                      <p>
                        <SiteText field={`about.field.${value.id}.text`}>{value.text}</SiteText>
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ),
          certificates: (
            <section className="section" id="certificates">
              <div className="about-copy">
                <span className="eyebrow">
                  <SiteText field="copy.aboutpage.9">گواهینامه ها و افتخارات</SiteText>
                </span>
                <h2>
                  <SiteText field="copy.aboutpage.10">
                    گواهینامه ها و افتخارات حال نیکو سلامت
                  </SiteText>
                </h2>
                <p>
                  <SiteText field="copy.aboutpage.11">
                    برای دریافت اطلاعات گواهینامه‌ها و افتخارات شرکت، با ما در ارتباط باشید.
                  </SiteText>
                </p>
                <a
                  className="button primary"
                  href="/contact"
                  onClick={(event) => navigate(event, '/contact')}
                >
                  <SiteText field="copy.aboutpage.12">ارتباط با ما </SiteText>
                  <Icon name="arrow" size={18} />
                </a>
              </div>
            </section>
          ),
          stats: (
            <section className="section about-stats">
              <div>
                <strong>
                  <SiteText field="copy.aboutpage.13">+۳ سال</SiteText>
                </strong>
                <span>
                  <SiteText field="copy.aboutpage.14">تلاش و توسعه</SiteText>
                </span>
              </div>
              <i />
              <div>
                <strong>
                  <SiteText field="copy.aboutpage.15">۴</SiteText>
                </strong>
                <span>
                  <SiteText field="copy.aboutpage.16">حوزه تخصصی</SiteText>
                </span>
              </div>
              <i />
              <div>
                <strong>
                  <SiteText field="copy.aboutpage.17">ایران</SiteText>
                </strong>
                <span>
                  <SiteText field="copy.aboutpage.18">تولیدکننده ایرانی</SiteText>
                </span>
              </div>
              <i />
              <div>
                <strong>
                  <SiteText field="copy.aboutpage.19">PharmuCare</SiteText>
                </strong>
                <span>
                  <SiteText field="copy.aboutpage.20">توزیع‌کننده رسمی</SiteText>
                </span>
              </div>
            </section>
          ),
        }}
      />
    </main>
  )
}
