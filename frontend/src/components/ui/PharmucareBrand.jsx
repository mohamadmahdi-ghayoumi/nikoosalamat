import React from 'react'

export default function PharmucareBrand() {
  return (
    <div className="pharmucare-brand">
      <span className="eyebrow">فارمیوکِر</span>
      <img
        src="/images/pharmucare-logo.png"
        alt="لوگوی فارمیوکِر — PharmuCare"
        width="1952"
        height="319"
        loading="lazy"
      />
      <p>مراقبت سبز، سلامت پایدار</p>
      <div className="pharmucare-brand-tags" aria-label="ویژگی‌های فارمیوکِر">
        <span>شیمی سبز</span>
        <span>بدون آنتی بیوتیک</span>
        <span>ایمن و غیرسمی</span>
        <span>دوست دار محیط زیست</span>
      </div>
    </div>
  )
}
