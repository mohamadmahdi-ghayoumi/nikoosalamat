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
      <div className="pharmucare-brand-tags" aria-label="زمینه‌های محصولات فارمیوکِر">
        <span>دامپروری</span>
        <span>کشاورزی</span>
        <span>پرورش اسب</span>
      </div>
    </div>
  )
}
