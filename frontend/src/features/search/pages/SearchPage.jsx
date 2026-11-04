import React, { useEffect, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { searchSite } from '../../../services/api/search.js'

const labels = { product: 'محصول', article: 'مقاله', page: 'صفحه' }

export default function SearchPage({ query, navigate }) {
  const [term, setTerm] = useState(query)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    setTerm(query)
  }, [query])
  useEffect(() => {
    let active = true
    setData(null)
    setError('')
    if (!query.trim()) {
      setLoading(false)
      return
    }
    setLoading(true)
    searchSite(query.trim())
      .then((result) => {
        if (active) setData(result)
      })
      .catch(() => {
        if (active)
          setError('دریافت نتایج ممکن نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [query, retry])
  return (
    <main className="inner-page search-page" id="top">
      <section className="section search-content">
        <span className="eyebrow">جست‌وجو در نیکو سلامت</span>
        <h1>دنبال چه چیزی می‌گردید؟</h1>
        <form
          className="site-search-form"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            if (term.trim()) {
              if (term.trim() === query) setRetry((value) => value + 1)
              else navigate(event, `/search?q=${encodeURIComponent(term.trim())}`)
            }
          }}
        >
          <input
            type="search"
            name="q"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            required
            maxLength={120}
            aria-label="عبارت جست‌وجو"
            placeholder="نام محصول یا موضوع موردنظر…"
          />
          <button className="button primary" type="submit">
            <Icon name="search" size={20} />
            <span>جست‌وجو</span>
          </button>
        </form>
        <div className="search-status" role="status" aria-live="polite">
          {loading
            ? 'در حال جست‌وجو…'
            : data
              ? `${new Intl.NumberFormat('fa-IR').format(data.total)} نتیجه برای «${query}»`
              : !query.trim()
                ? 'نام محصول یا موضوع موردنظر را وارد کنید.'
                : ''}
        </div>
        {error && (
          <div className="empty-state" role="alert">
            <p>{error}</p>
            <button className="button outline" onClick={() => setRetry((value) => value + 1)}>
              تلاش دوباره
            </button>
          </div>
        )}
        {data?.total === 0 && (
          <div className="empty-state">
            <Icon name="search" size={30} />
            <h2>نتیجه‌ای پیدا نشد</h2>
            <p>عبارت کوتاه‌تر یا واژهٔ دیگری را امتحان کنید.</p>
            <a
              className="button outline"
              href="/contact"
              onClick={(event) => navigate(event, '/contact')}
            >
              از ما راهنمایی بگیرید
            </a>
          </div>
        )}
        <div className="search-results">
          {data?.results.map((item) => (
            <a
              className="search-result"
              key={item.path}
              href={item.path}
              onClick={(event) => navigate(event, item.path)}
            >
              <span className="search-kind">{labels[item.kind] || 'صفحه'}</span>
              <h2>{item.title}</h2>
              <p>{item.excerpt}</p>
              <span className="solution-action">
                مشاهده <Icon name="arrow" size={18} />
              </span>
            </a>
          ))}
        </div>
        {data?.total > data?.results.length && (
          <p className="search-status">
            ۳۰ نتیجهٔ اول نمایش داده شده است؛ برای نتایج دقیق‌تر، عبارت مشخص‌تری وارد کنید.
          </p>
        )}
      </section>
    </main>
  )
}
