import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'

export default function ContactDetails() {
  return (
    <div className="contact-details" id="sales">
      <span className="eyebrow">راه‌های ارتباطی</span>
      <h2>پاسخ‌گوی شما هستیم</h2>
      <p>
        برای مشاوره محصولات، استعلام موجودی یا بررسی شرایط همکاری می‌توانید از راه‌های زیر با مجموعه
        در تماس باشید.
      </p>
      <div className="contact-cards">
        <a href="tel:+989124283834">
          <span>
            <Icon name="phone" />
          </span>
          <div>
            <small>مدیر فروش</small>
            <strong>۰۹۱۲۴۲۸۳۸۳۴</strong>
          </div>
        </a>
        <a href="mailto:info@nikoosalamat.ir">
          <span>
            <Icon name="mail" />
          </span>
          <div>
            <small>ایمیل</small>
            <strong>info@nikoosalamat.ir</strong>
          </div>
        </a>
        <a href="https://t.me/nikoosalamat" target="_blank" rel="noreferrer">
          <span>
            <Icon name="telegram" />
          </span>
          <div>
            <small>تلگرام</small>
            <strong dir="ltr">@nikoosalamat</strong>
          </div>
        </a>
        <div>
          <span>
            <Icon name="map-pin" />
          </span>
          <div>
            <small>آدرس</small>
            <strong>شهر قدس، بلوار ۴۵ متری انقلاب، کوی صنعت، پلاک ۵</strong>
          </div>
        </div>
        <div>
          <span>
            <Icon name="mailbox" />
          </span>
          <div>
            <small>کد پستی</small>
            <strong>۳۱۱۴۸۱۵۹۵۵</strong>
          </div>
        </div>
      </div>
      <div className="contact-note">
        <Icon name="leaf" />
        <p>
          برای پاسخ‌گویی دقیق‌تر، نام محصول، تعداد موردنیاز و موضوع درخواست خود را در پیام بنویسید.
        </p>
      </div>
    </div>
  )
}
