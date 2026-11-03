import React, { useEffect, useState } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { getArticles } from '../../../services/api/articles.js'
import ArticleCard from '../components/ArticleCard.jsx'

export default function ArticlesPage({ navigate }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticles()
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="inner-page magazine-page" id="top">
      <header className="magazine-heading section">
        <span className="eyebrow">دانش و تجربه، از علم تا مزرعه</span>
        <h1>مجله نیکو سلامت</h1>
        <p>مطالب آموزشی و علمی درباره سلامت دام، مراقبت، بهداشت و بهره‌وری پایدار.</p>
      </header>
      <section className="section articles-section">
        {loading ? (
          <div className="content-loading">در حال دریافت مقالات…</div>
        ) : articles.length ? (
          <div className="article-grid">
            {articles.map((article, index) => (
              <ArticleCard article={article} index={index} navigate={navigate} key={article.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Icon name="leaf" size={30} />
            <h2>به‌زودی در مجله نیکو سلامت</h2>
            <p>مطالب تازه درباره سلامت دام و مراقبت‌های روزانه را اینجا بخوانید.</p>
          </div>
        )}
      </section>
    </main>
  )
}
