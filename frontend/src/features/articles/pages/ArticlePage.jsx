import React, { useEffect, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { resolveMediaUrl } from '../../../services/api/client.js'
import { getArticle } from '../../../services/api/articles.js'
import ArticleMeta from '../components/ArticleMeta.jsx'
import ContentBody from '../../../components/ui/ContentBody.jsx'

export default function ArticlePage({ slug, navigate }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getArticle(slug)
      .then((data) => {
        setArticle(data)
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <main className="content-loading">در حال دریافت مقاله…</main>
  if (error || !article)
    return (
      <main className="not-found">
        <span>۴۰۴</span>
        <h1>مقاله پیدا نشد</h1>
        <p>{error}</p>
        <button className="button primary" onClick={(event) => navigate(event, '/articles')}>
          بازگشت به مقالات
        </button>
      </main>
    )

  return (
    <main className="inner-page article-detail" id="top">
      <header className="article-heading">
        <a
          className="article-back"
          href="/articles"
          onClick={(event) => navigate(event, '/articles')}
        >
          مجله نیکو سلامت <Icon name="arrow" size={16} />
        </a>
        <h1>{article.title}</h1>
        {article.excerpt && <p className="article-standfirst">{article.excerpt}</p>}
        <ArticleMeta article={article} />
      </header>
      <article className="section editorial-content">
        {article.image_url && (
          <img
            className="editorial-cover article-cover"
            src={resolveMediaUrl(article.image_url)}
            alt={article.title}
          />
        )}
        <div className="article-reading">
          <div className="editorial-body">
            <ContentBody text={article.body} />
          </div>
          <div className="article-ending">
            <a
              className="button outline"
              href="/articles"
              onClick={(event) => navigate(event, '/articles')}
            >
              مقاله‌های بیشتر <Icon name="arrow" size={18} />
            </a>
          </div>
        </div>
      </article>
    </main>
  )
}
