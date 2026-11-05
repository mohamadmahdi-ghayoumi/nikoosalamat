import React from 'react'

export default function PharmucareBrand() {
  return (
    <div className="pharmucare-brand">
      <span className="eyebrow">همکاری با فارمیوکِر</span>
      <img
        src="/images/pharmucare-logo.png"
        alt="لوگوی فارمیوکِر — PharmuCare"
        width="1952"
        height="319"
        loading="lazy"
      />
      <p>محصولات تخصصی برای سلامت و بهداشت دام</p>
      <div className="pharmucare-brand-tags" aria-label="زمینه‌های محصولات فارمیوکِر">
        <span>مراقبت از سُم</span>
        <span>سلامت پستان</span>
        <span>بهداشت دامداری</span>
      </div>
    </div>
  )
}
