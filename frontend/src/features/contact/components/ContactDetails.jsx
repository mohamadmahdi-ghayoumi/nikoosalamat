import { SiteText, useSiteConfig, siteLink } from '../../site/SiteConfig.jsx'
import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'

export default function ContactDetails() {
  const { config } = useSiteConfig()
  return (
    <div className="contact-details" id="sales">
      <span className="eyebrow">
        <SiteText field="copy.contactdetails.0">راه‌های ارتباطی</SiteText>
      </span>
      <h2>
        <SiteText field="copy.contactdetails.1">پاسخ‌گوی شما هستیم</SiteText>
      </h2>
      <p>
        <SiteText field="copy.contactdetails.2">
          برای مشاوره محصولات، استعلام موجودی یا بررسی شرایط همکاری می‌توانید از راه‌های زیر با
          مجموعه در تماس باشید.
        </SiteText>
      </p>
      <div className="contact-cards">
        <a href={siteLink(config, 'contact.phone', 'tel:+989124283834')}>
          <span>
            <Icon name="phone" />
          </span>
          <div>
            <small>
              <SiteText field="copy.contactdetails.3">مهندس محمدباقر</SiteText>
            </small>
            <strong>
              <SiteText field="copy.contactdetails.4">۰۹۱۲۴۲۸۳۸۳۴</SiteText>
            </strong>
          </div>
        </a>
        <a href={siteLink(config, 'contact.email', 'mailto:info@nikoosalamat.ir')}>
          <span>
            <Icon name="mail" />
          </span>
          <div>
            <small>
              <SiteText field="copy.contactdetails.5">ایمیل</SiteText>
            </small>
            <strong>
              <SiteText field="copy.contactdetails.6">info@nikoosalamat.ir</SiteText>
            </strong>
          </div>
        </a>
        <a
          href={siteLink(config, 'contact.telegram', 'https://t.me/nikoosalamat')}
          target="_blank"
          rel="noreferrer"
        >
          <span>
            <Icon name="telegram" />
          </span>
          <div>
            <small>
              <SiteText field="copy.contactdetails.7">تلگرام</SiteText>
            </small>
            <strong dir="ltr">
              <SiteText field="copy.contactdetails.8">@nikoosalamat</SiteText>
            </strong>
          </div>
        </a>
        <div>
          <span>
            <Icon name="map-pin" />
          </span>
          <div>
            <small>
              <SiteText field="copy.contactdetails.9">آدرس</SiteText>
            </small>
            <strong>
              <SiteText field="copy.contactdetails.10">
                شهر قدس، بلوار ۴۵ متری انقلاب، کوی صنعت، پلاک ۵
              </SiteText>
            </strong>
          </div>
        </div>
        <div>
          <span>
            <Icon name="mailbox" />
          </span>
          <div>
            <small>
              <SiteText field="copy.contactdetails.11">کد پستی</SiteText>
            </small>
            <strong>
              <SiteText field="copy.contactdetails.12">۳۱۱۴۸۱۵۹۵۵</SiteText>
            </strong>
          </div>
        </div>
      </div>
      <div className="contact-note">
        <Icon name="leaf" />
        <p>
          <SiteText field="copy.contactdetails.13">
            برای پاسخ‌گویی دقیق‌تر، نام محصول، تعداد موردنیاز و موضوع درخواست خود را در پیام
            بنویسید.
          </SiteText>
        </p>
      </div>
    </div>
  )
}
