import React, { useEffect, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { resolveMediaUrl } from '../../../services/api/client.js'
import { getContentPage } from '../../../services/api/pages.js'
import PageHero from '../../../components/ui/PageHero.jsx'
import ContentBody from '../../../components/ui/ContentBody.jsx'
import useNoIndex from '../../../hooks/useNoIndex.js'
import useEntitySEO from '../../../hooks/useEntitySEO.js'

export default function ContentPageView({ slug, navigate }) {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useNoIndex(!loading && Boolean(error || !page))
  useEntitySEO(!loading && !error ? page : null, 'page')

  useEffect(() => {
    let active = true
    setLoading(true)
    setPage(null)
    getContentPage(slug)
      .then((data) => {
        if (!active) return
        setPage(data)
        setError('')
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])

  if (loading) return <main className="content-loading">در حال دریافت صفحه…</main>
  if (error || !page)
    return (
      <main className="not-found">
        <span>۴۰۴</span>
        <h1>این صفحه در دسترس نیست</h1>
        <p>{error}</p>
        <button className="button primary" onClick={(event) => navigate(event, '/')}>
          بازگشت به خانه
        </button>
      </main>
    )

  return (
    <main className="inner-page content-page" id="top">
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.summary} />
      <article className="section editorial-content">
        {page.image_url && (
          <img className="editorial-cover" src={resolveMediaUrl(page.image_url)} alt={page.title} />
        )}
        <div className="editorial-body">
          <ContentBody text={page.body} />
        </div>
        <a
          className="button outline"
          href="/products"
          onClick={(event) => navigate(event, '/products')}
        >
          مشاهده محصولات <Icon name="arrow" size={18} />
        </a>
      </article>
    </main>
  )
}
