import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { subscribeNewsletter } from '../../../services/api/contact.js'

export default function NewsletterSection({ showNotice, onApiOnline }) {
  const handleNewsletterSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const mobile = String(formData.get('mobile') || '').replace(/[۰-۹]/g, (digit) =>
      '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit),
    )

    try {
      const result = await subscribeNewsletter(mobile)
      form.reset()
      onApiOnline()
      showNotice(result.message)
    } catch (error) {
      showNotice(error.name === 'AbortError' ? 'سرور پاسخ نداد؛ دوباره تلاش کنید' : error.message)
    }
  }
  return (
    <section className="newsletter" id="contact">
      <div>
        <span className="eyebrow">باشگاه نیکو سلامت</span>
        <h2>نکته‌های مراقبتی و خبرهای تازه</h2>
        <p>ماهی دو بار؛ کوتاه، کاربردی و بدون پیام‌های اضافه.</p>
      </div>
      <form onSubmit={handleNewsletterSubmit}>
        <input
          name="mobile"
          type="tel"
          inputMode="numeric"
          placeholder="شماره موبایل"
          aria-label="شماره موبایل"
          required
          pattern="[0-9۰-۹]{10,13}"
        />
        <button className="button primary" type="submit">
          عضویت در باشگاه <Icon name="arrow" size={18} />
        </button>
      </form>
    </section>
  )
}
