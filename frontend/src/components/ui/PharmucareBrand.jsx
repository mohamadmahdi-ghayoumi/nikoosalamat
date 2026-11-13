import React from 'react'
import { EditableText } from '../../features/home/components/HomeTextEditor.jsx'
import { SiteText, SiteImage } from '../../features/site/SiteConfig.jsx'

export default function PharmucareBrand({ language = 'fa', editable = false }) {
  const english = language === 'en'
  const traits = english
    ? ['Green Chemistry', 'Non-Antibiotic', 'Eco-Friendly', 'Safe and Non-Toxic']
    : ['شیمی سبز', 'بدون آنتی بیوتیک', 'ایمن و غیرسمی', 'دوست دار محیط زیست']
  return (
    <div className="pharmucare-brand">
      {!english && <span className="eyebrow">فارمیوکِر</span>}
      <SiteImage
        field="brand.pharmucare"
        src="/images/pharmucare-logo.png"
        alt="لوگوی فارمیوکِر — PharmuCare"
        width="1952"
        height="319"
        loading="lazy"
      />
      <p lang={english ? 'en' : 'fa'} dir={english ? 'ltr' : 'rtl'}>
        {editable ? (
          <EditableText field="brand.tagline">
            {english ? 'Green Care, Sustainable Health' : 'مراقبت سبز، سلامت پایدار'}
          </EditableText>
        ) : english ? (
          <SiteText field="home.brand.tagline">Green Care, Sustainable Health</SiteText>
        ) : (
          'مراقبت سبز، سلامت پایدار'
        )}
      </p>
      <div
        className="pharmucare-brand-tags"
        aria-label="ویژگی‌های فارمیوکِر"
        lang={english ? 'en' : 'fa'}
        dir={english ? 'ltr' : 'rtl'}
      >
        {traits.map((trait, index) => (
          <span key={trait}>
            {editable ? (
              <EditableText field={`brand.trait.${index}`}>{trait}</EditableText>
            ) : english ? (
              <SiteText field={`home.brand.trait.${index}`}>{trait}</SiteText>
            ) : (
              trait
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
