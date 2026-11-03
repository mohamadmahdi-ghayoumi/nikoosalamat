import React from 'react'

export default function NotFoundPage({ navigate }) {
  return (
    <main className="not-found">
      <span>۴۰۴</span>
      <h1>این صفحه پیدا نشد</h1>
      <p>ممکن است آدرس تغییر کرده باشد.</p>
      <button className="button primary" onClick={(event) => navigate(event, '/')}>
        بازگشت به صفحه اصلی
      </button>
    </main>
  )
}
