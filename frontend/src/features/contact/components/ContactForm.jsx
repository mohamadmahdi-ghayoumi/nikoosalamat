import { SiteText } from '../../site/SiteConfig.jsx'
import React, { useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { sendContactMessage } from '../../../services/api/contact.js'
import { normalizeDigits, normalizeMobile } from '../../../utils/persian.js'
import { normalizeContact, validateContact } from '../utils/validation.js'

export default function ContactForm({ showNotice }) {
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const errorFor = (name) =>
    errors[name] && (
      <span className="field-error" id={`contact-${name}-error`} role="alert">
        {errors[name]}
      </span>
    )

  const submitContact = async (event) => {
    event.preventDefault()
    if (sending) return
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const nextErrors = validateContact(values)
    setErrors(nextErrors)
    setRequestError('')
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => form.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    const data = normalizeContact(values)
    setSending(true)
    try {
      const response = await sendContactMessage(data)
      form.reset()
      showNotice(response.message)
    } catch (error) {
      setRequestError(
        error.name === 'AbortError'
          ? 'سرور پاسخ نداد؛ دوباره تلاش کنید.'
          : /[آ-ی]/.test(error.message)
            ? error.message
            : 'ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.',
      )
    } finally {
      setSending(false)
    }
  }
  return (
    <form
      className="contact-form"
      id="contact-form"
      noValidate
      onSubmit={submitContact}
      onInput={(event) => {
        const name = event.target.name
        if (errors[name]) {
          const currentErrors = validateContact(
            Object.fromEntries(new FormData(event.currentTarget)),
          )
          setErrors((previous) => ({ ...previous, [name]: currentErrors[name] }))
        }
      }}
    >
      <div className="form-heading">
        <span>
          <SiteText field="copy.contactform.1">فرم تماس</SiteText>
        </span>
        <h2>
          <SiteText field="copy.contactform.2">پیامتان را برای ما بنویسید</SiteText>
        </h2>
      </div>
      <label>
        <SiteText field="copy.contactform.3">نام و نام خانوادگی</SiteText>
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="مثلاً آرش رضایی"
          minLength="2"
          maxLength="80"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
        />
        {errorFor('name')}
      </label>
      <div className="form-row">
        <label>
          <span className="contact-field-label">
            <SiteText field="copy.contactform.4">شماره موبایل</SiteText>
          </span>
          <input
            name="mobile"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            placeholder="09123456789"
            pattern="(?:\+98|0098|98|0)?9[0-9]{9}"
            onInput={(event) => {
              event.currentTarget.value = normalizeDigits(event.currentTarget.value)
            }}
            onBlur={(event) => {
              event.currentTarget.value = normalizeMobile(event.currentTarget.value)
            }}
            aria-invalid={Boolean(errors.mobile)}
            aria-describedby={errors.mobile ? 'contact-mobile-error' : undefined}
            required
          />
          {errorFor('mobile')}
        </label>
        <label>
          <span className="contact-field-label">
            <SiteText field="copy.contactform.5">ایمیل </SiteText>
            <small>
              <SiteText field="copy.contactform.6">(اختیاری)</SiteText>
            </small>
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
          {errorFor('email')}
        </label>
      </div>
      <label>
        <SiteText field="copy.contactform.7">متن پیام</SiteText>
        <textarea
          name="message"
          rows="6"
          placeholder="موضوع یا سؤال خود را بنویسید..."
          minLength="10"
          maxLength="2000"
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {errorFor('message')}
      </label>
      <button className="button primary" type="submit" disabled={sending}>
        {sending ? 'در حال ارسال...' : 'ارسال پیام'} <Icon name="arrow" size={18} />
      </button>
      {requestError && (
        <p className="form-error" role="alert">
          {requestError}
        </p>
      )}
      <p className="form-privacy">
        <SiteText field="copy.contactform.8">
          اطلاعات شما فقط برای پاسخ‌گویی به همین پیام استفاده می‌شود.
        </SiteText>
      </p>
    </form>
  )
}
