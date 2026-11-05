import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import PageHero from '../../../components/ui/PageHero.jsx'
import PharmucareBrand from '../../../components/ui/PharmucareBrand.jsx'

export default function AboutPage({ navigate }) {
  const values = [
    {
      icon: 'heart',
      title: 'دامپروری',
      text: 'راهکارهای تخصصی برای ارتقای سلامت و بهداشت دام و افزایش بهره‌وری پایدار دامداری.',
    },
    {
      icon: 'shield',
      title: 'پرورش اسب',
      text: 'محصولات و راهکارهای مراقبتی متناسب با نیازهای سلامت و بهداشت اسب.',
    },
    {
      icon: 'leaf',
      title: 'کشاورزی',
      text: 'راهکارهای نوین برای رشد مطلوب گیاهان و کمک به توسعه پایدار کشاورزی.',
    },
  ]

  return (
    <main className="inner-page" id="top">
      <PageHero
        eyebrow="درباره شرکت حال نیکو سلامت"
        title="همراه سلامت و بهره‌وری، از علم تا مزرعه"
        description="توسعه راهکارهای تخصصی برای دامپروری، پرورش اسب و کشاورزی با تکیه بر دانش، تجربه و تعهد."
      />
      <section className="section about-intro" id="company">
        <div className="about-copy">
          <span className="eyebrow">معرفی شرکت</span>
          <h2>سلامت و بهداشت، پایه‌ی بهره‌وری پایدار</h2>
          <p>
            در شرکت حال نیکو سلامت، هدف ما روشن است: ارتقای بهداشت و سلامت در سه حوزه دامپروری،
            پرورش اسب و کشاورزی. با بیش از سه سال تلاش پیوسته و بهره‌گیری از دانش و تجربه متخصصان
            این حوزه، موفق به توسعه فرمولاسیون‌های نوین و منطبق با استانداردهای جهانی شده‌ایم.
          </p>
          <p>
            ما همواره در کنار شما هستیم تا بهترین راهکارها و محصولات تخصصی را برای تضمین سلامت دام،
            اسب و رشد مطلوب گیاهان در اختیارتان قرار دهیم.
          </p>
          <button className="button primary" onClick={(event) => navigate(event, '/contact')}>
            ارتباط با حال نیکو سلامت <Icon name="arrow" size={18} />
          </button>
        </div>
        <div className="about-visual">
          <div className="about-image" role="img" aria-label="دام سالم در محیط دامداری" />
          <div className="about-quote">«همراه دامداران در مسیر سلامت و بهره‌وری»</div>
        </div>
      </section>
      <section
        className="section pharmucare-section"
        id="pharmucare"
        aria-labelledby="pharmucare-title"
      >
        <div className="pharmucare-intro">
          <div className="about-copy">
            <span className="eyebrow">فارمیوکِر</span>
            <h2 id="pharmucare-title">همراه سلامت و بهداشت دام</h2>
            <p>
              ما به‌عنوان یک تولیدکننده ایرانی و توزیع‌کننده رسمی محصولات شرکت فارمیوکِر
              (PharmuCare)، مجموعه‌ای متنوع و پیشرفته از محصولات را ارائه می‌کنیم؛ از مراقبت‌های
              تخصصی سلامت اندام‌های حرکتی دام تا راه‌حل‌های مقابله با تب برفکی و کنترل مگس، با هدف
              افزایش بهره‌وری و حفظ بهداشت محیط زیست.
            </p>
            <a
              className="button primary"
              href="/products"
              onClick={(event) => navigate(event, '/products')}
            >
              مشاهده محصولات <Icon name="arrow" size={18} />
            </a>
          </div>
          <PharmucareBrand />
        </div>
      </section>
      <section className="values-section" id="fields">
        <div className="section values-inner">
          <div className="section-heading center-heading">
            <div>
              <span className="eyebrow light">حوزه‌های فعالیت</span>
              <h2>
                سه مسیر، یک <em>تعهد</em>
              </h2>
            </div>
          </div>
          <div className="values-grid">
            {values.map((value) => (
              <article
                key={value.title}
                id={
                  value.title === 'دامپروری'
                    ? 'livestock'
                    : value.title === 'پرورش اسب'
                      ? 'horses'
                      : 'agriculture'
                }
              >
                <span>
                  <Icon name={value.icon} size={29} />
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="human">
        <div className="about-copy">
          <span className="eyebrow">انسانی</span>
          <h2>محصولات حوزه انسانی</h2>
          <p>
            برای دریافت اطلاعات محصولات حوزه انسانی، با کارشناسان حال نیکو سلامت در ارتباط باشید.
          </p>
          <a
            className="button primary"
            href="/contact"
            onClick={(event) => navigate(event, '/contact')}
          >
            ارتباط با ما <Icon name="arrow" size={18} />
          </a>
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
          <strong>۳</strong>
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
