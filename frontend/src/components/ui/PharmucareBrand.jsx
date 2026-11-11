import React from 'react'
import { EditableText } from '../../features/home/components/HomeTextEditor.jsx'

export default function PharmucareBrand({ language = 'fa', editable = false }) {
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
        {editable ? (
          <EditableText field="brand.tagline">
            {english ? 'Green Care, Sustainable Health' : 'مراقبت سبز، سلامت پایدار'}
          </EditableText>
        ) : english ? (
          'Green Care, Sustainable Health'
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
            {editable ? <EditableText field={`brand.trait.${index}`}>{trait}</EditableText> : trait}
          </span>
        ))}
      </div>
    </div>
  )
}
