import React, { useEffect, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { getArticles } from '../../../services/api/articles.js'
import ArticleCard from '../components/ArticleCard.jsx'
import PageHero from '../../../components/ui/PageHero.jsx'
import { magazineCategories, magazineCategoryUrl } from '../data/magazineCategories.js'
import useNoIndex from '../../../hooks/useNoIndex.js'

function rememberedPage(category) {
  try {
    return Math.max(
      1,
      Math.min(100, Number(sessionStorage.getItem(`niko_mag_page_${category}`)) || 1),
    )
  } catch {
    return 1
  }
}

export default function ArticlesPage({ navigate, currentSearch = '' }) {
  const category = new URLSearchParams(currentSearch).get('category') || 'latest'
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(() => rememberedPage(category))
  const selected = magazineCategories.find((item) => item.slug === category)
  useNoIndex(!selected)

  useEffect(() => {
    let active = true
    getArticles()
      .then((data) => {
        if (active) {
          setArticles(data)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('دریافت مطالب انجام نشد؛ اتصال را بررسی و دوباره تلاش کنید.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])
  useEffect(() => {
    setPage(rememberedPage(category))
    document
      .querySelector('.magazine-category-nav [aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [category])
  const filtered =
    category === 'latest' ? articles : articles.filter((article) => article.category === category)
  const visible = filtered.slice(0, page * 12)
  function showMore() {
    const nextPage = page + 1
    try {
      sessionStorage.setItem(`niko_mag_page_${category}`, String(nextPage))
    } catch {
      /* Private browsing can restrict storage. */
    }
    setPage(nextPage)
  }

  return (
    <main className="inner-page magazine-page" id="top">
      <PageHero
        artwork="articles"
        eyebrow="دانش و تجربه، از علم تا مزرعه"
        title="مجله نیکو سلامت"
        description="مطالب آموزشی و علمی درباره سلامت دام، مراقبت، بهداشت و بهره‌وری پایدار."
      />
      <div className="magazine-navigation section">
        <a
          className="magazine-brand"
          href="/mag/"
          onClick={(event) => navigate(event, '/mag/')}
          aria-label="صفحه اصلی مجله نیکو سلامت"
        >
          <img src="/images/niko-mag-logo.png" alt="نیکومگ" width="1957" height="784" />
        </a>
        <nav className="magazine-category-nav" aria-label="دسته‌بندی مجله">
          {magazineCategories.map((item) => (
            <a
              key={item.slug}
              href={magazineCategoryUrl(item.slug)}
              aria-current={category === item.slug ? 'page' : undefined}
              onClick={(event) => navigate(event, magazineCategoryUrl(item.slug))}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <section
        className="section articles-section"
        aria-label={selected?.label || 'دسته‌بندی نامعتبر'}
      >
        {!selected ? (
          <div className="empty-state">
            <h2>دسته‌بندی پیدا نشد</h2>
            <a
              href="/mag/"
              className="button outline"
              onClick={(event) => navigate(event, '/mag/')}
            >
              همه مطالب مجله
            </a>
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <p>{error}</p>
            <button className="button outline" onClick={() => window.location.reload()}>
              تلاش دوباره
            </button>
          </div>
        ) : loading ? (
          <div className="magazine-grid" aria-busy="true" aria-label="در حال دریافت مقالات">
            {Array.from({ length: 7 }, (_, index) => (
              <div
                className={`magazine-skeleton ${index < 3 ? 'magazine-card-lead' : ''}`}
                key={index}
              >
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : filtered.length ? (
          <>
            <div
              className={`magazine-grid ${category !== 'latest' ? 'magazine-grid-category' : ''}`}
            >
              {visible.map((article, index) => (
                <ArticleCard article={article} index={index} navigate={navigate} key={article.id} />
              ))}
            </div>
            {visible.length < filtered.length && (
              <div className="magazine-more">
                <button className="button outline" onClick={showMore}>
                  مطالب بیشتر <Icon name="arrow" size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Icon name="leaf" size={30} />
            <h2>
              {category === 'latest'
                ? 'به‌زودی در مجله نیکو سلامت'
                : `به‌زودی در بخش ${selected.label}`}
            </h2>
            <p>مطالب این بخش پس از انتشار در پنل مدیریت، اینجا نمایش داده می‌شوند.</p>
            {category !== 'latest' && (
              <a href="/mag/" onClick={(event) => navigate(event, '/mag/')}>
                دیدن جدیدترین مطالب
              </a>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
