import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { resolveMediaUrl } from '../../../services/api/client.js'

export default function ArticleList({ articles, setEditingArticle, removeArticle }) {
  return (
    <section className="admin-products">
      <div className="admin-list-head">
        <div>
          <span>فهرست مقالات</span>
          <h2>{new Intl.NumberFormat('fa-IR').format(articles.length)} مقاله</h2>
        </div>
      </div>
      <div className="admin-article-list">
        {articles.map((article) => (
          <article key={article.id}>
            {article.image_url ? (
              <img src={resolveMediaUrl(article.image_url)} alt="" />
            ) : (
              <span className="article-mini-placeholder">
                <Icon name="leaf" />
              </span>
            )}
            <div>
              <span>{article.published ? 'منتشرشده' : 'پیش‌نویس'}</span>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </div>
            <div className="admin-row-actions">
              <button onClick={() => setEditingArticle(article)}>ویرایش</button>
              <button className="danger" onClick={() => removeArticle(article)}>
                حذف
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
