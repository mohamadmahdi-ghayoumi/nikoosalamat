import React, { useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { sendContactMessage } from '../../../services/api/contact.js'

export default function ContactForm({ showNotice }) {
  const [sending, setSending] = useState(false)

  const submitContact = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    if (!data.email) delete data.email
    setSending(true)
    try {
      const response = await sendContactMessage(data)
      form.reset()
      showNotice(response.message)
    } catch (error) {
      showNotice(error.name === 'AbortError' ? 'سرور پاسخ نداد؛ دوباره تلاش کنید' : error.message)
    } finally {
      setSending(false)
    }
  }
  return (
    <form className="contact-form" id="contact-form" onSubmit={submitContact}>
      <div className="form-heading">
        <span>فرم تماس</span>
        <h2>پیامتان را برای ما بنویسید</h2>
      </div>
      <label>
        نام و نام خانوادگی
        <input name="name" type="text" placeholder="مثلاً آرش رضایی" minLength="2" required />
      </label>
      <div className="form-row">
        <label>
          شماره موبایل
          <input
            name="mobile"
            type="tel"
            dir="ltr"
            placeholder="09123456789"
            pattern="(?:\+98|0098|98|0)?9[0-9]{9}"
            required
          />
        </label>
        <label>
          ایمیل <small>(اختیاری)</small>
          <input name="email" type="email" dir="ltr" placeholder="you@example.com" />
        </label>
      </div>
      <label>
        متن پیام
        <textarea
          name="message"
          rows="6"
          placeholder="موضوع یا سؤال خود را بنویسید..."
          minLength="10"
          required
        />
      </label>
      <button className="button primary" type="submit" disabled={sending}>
        {sending ? 'در حال ارسال...' : 'ارسال پیام'} <Icon name="arrow" size={18} />
      </button>
      <p className="form-privacy">اطلاعات شما فقط برای پاسخ‌گویی به همین پیام استفاده می‌شود.</p>
    </form>
  )
}
