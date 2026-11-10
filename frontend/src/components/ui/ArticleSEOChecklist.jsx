import React, { useMemo } from 'react'
import { articleHTML, articlePlainText } from '../../utils/articleContent.js'

export default function ArticleSEOChecklist({ title, excerpt, body }) {
  const checks = useMemo(() => {
    const root = document.createElement('div')
    root.innerHTML = articleHTML(body)
    const headings = [...root.querySelectorAll('h2,h3,h4,h5,h6')]
    let previous = 1
    const ordered = headings.every((heading) => {
      const level = Number(heading.tagName[1])
      const valid = level <= previous + 1
      previous = level
      return valid
    })
    const images = [...root.querySelectorAll('img')]
    const links = [...root.querySelectorAll('a[href]')]
    return [
      [Boolean(title.trim()), 'عنوان را وارد کنید؛ توصیفی‌بودن آن را خودتان بررسی کنید.'],
      [Boolean(excerpt.trim()), 'خلاصه را وارد کنید؛ بهتر است مخصوص همین مقاله باشد.'],
      [articlePlainText(body).trim().length > 0, 'متن مقاله وارد شده باشد؛ مفید و اصیل‌بودن آن نیاز به بررسی خودتان دارد.'],
      [headings.some((heading) => heading.tagName === 'H2'), 'بخش‌های اصلی متن را با «تیتر بخش (H2)» جدا کنید.'],
      [ordered, 'ترتیب تیترها را رعایت کنید: H2، سپس H3؛ سطح‌ها را نپرید.'],
      [images.every((image) => image.alt.trim()), images.length ? 'برای تمام عکس‌ها توضیح جایگزین نوشته شده است.' : 'اگر عکس افزودید، توضیح جایگزین دقیق برایش بنویسید.'],
      [links.every((link) => !/^(اینجا|کلیک کنید|بیشتر|click here)$/i.test(link.textContent.trim()) && link.textContent.trim().length > 2), 'متن لینک‌ها باید مقصدشان را توضیح دهد؛ نه فقط «اینجا».'],
    ]
  }, [title, excerpt, body])
  const pending = checks.filter(([done]) => !done).length
  return <details className="article-seo-checklist">
    <summary>راهنمای قبل از انتشار{pending ? ` — ${new Intl.NumberFormat('fa-IR').format(pending)} مورد برای بررسی` : ' — بررسی‌های پایه کامل است'}</summary>
    <ul>{checks.map(([done, text]) => <li key={text} className={done ? 'is-complete' : ''}><span aria-label={done ? 'انجام شده' : 'نیاز به بررسی'}>{done ? '✓' : '○'}</span>{text}</li>)}</ul>
    <p>این راهنما امتیاز سئو یا تضمین رتبهٔ گوگل نیست؛ موارد پیشنهادی مانع ذخیرهٔ مقاله نمی‌شوند.</p>
  </details>
}
