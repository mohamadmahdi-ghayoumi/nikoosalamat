import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { resolveMediaUrl } from '../../../services/api/client.js'
import ArticleMeta from './ArticleMeta.jsx'

export default function ArticleCard({ article, index, navigate }) {
  return (
    <a
      className={`article-card ${index === 0 ? 'article-featured' : ''}`}
      href={`/articles/${article.slug}`}
      onClick={(event) => navigate(event, `/articles/${article.slug}`)}
      key={article.id}
    >
      {article.image_url ? (
        <img
          src={resolveMediaUrl(article.image_url)}
          alt={article.title}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      ) : (
        <span className="article-placeholder">
          <Icon name="leaf" size={48} />
        </span>
      )}
      <div className="article-card-copy">
        <span className="eyebrow">{index === 0 ? 'از مجله نیکو سلامت' : 'دانش و تجربه'}</span>
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
        <ArticleMeta article={article} />
        <b>
          خواندن مقاله <Icon name="arrow" size={16} />
        </b>
      </div>
    </a>
  )
}
