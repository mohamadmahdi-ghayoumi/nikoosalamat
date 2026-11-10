import React from 'react'

export default function PharmucareBrand({ language = 'fa' }) {
  const english = language === 'en'
  const traits = english
    ? ['Green Chemistry', 'Non-Antibiotic', 'Eco-Friendly', 'Safe and Non-Toxic']
    : ['شیمی سبز', 'بدون آنتی بیوتیک', 'ایمن و غیرسمی', 'دوست دار محیط زیست']
  return (
    <div className="pharmucare-brand">
      {!english && <span className="eyebrow">فارمیوکِر</span>}
      <img
        src="/images/pharmucare-logo.png"
        alt="لوگوی فارمیوکِر — PharmuCare"
        width="1952"
        height="319"
        loading="lazy"
      />
      <p lang={english ? 'en' : 'fa'} dir={english ? 'ltr' : 'rtl'}>
        {english ? 'Green Care, Sustainable Health' : 'مراقبت سبز، سلامت پایدار'}
      </p>
      <div className="pharmucare-brand-tags" aria-label="ویژگی‌های فارمیوکِر" lang={english ? 'en' : 'fa'} dir={english ? 'ltr' : 'rtl'}>
        {traits.map((trait) => <span key={trait}>{trait}</span>)}
      </div>
    </div>
  )
}
