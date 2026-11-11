import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { resolveMediaUrl } from '../../../services/api/client.js'
import { magazineCategoryLabel } from '../data/magazineCategories.js'

export default function ArticleCard({ article, index, navigate }) {
  return (
    <a
      className={`magazine-card ${index < 3 ? 'magazine-card-lead' : ''}`}
      href={`/articles/${article.slug}`}
      onClick={(event) => navigate(event, `/articles/${article.slug}`)}
      key={article.id}
    >
      <div className="magazine-card-picture">
        {article.image_url ? (
          <img
            src={resolveMediaUrl(article.image_url)}
            alt={article.title}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <span className="article-placeholder">
            <Icon name="leaf" size={48} />
          </span>
        )}
        <span className="magazine-card-category">{magazineCategoryLabel(article.category)}</span>
      </div>
      <div className="magazine-card-copy">
        <h2>{article.title}</h2>
        <div className="magazine-card-footer">
          {article.created_at &&
            !Number.isNaN(new Date(article.created_at.replace(' ', 'T')).getTime()) && (
              <time dateTime={new Date(article.created_at.replace(' ', 'T')).toISOString()}>
                <Icon name="calendar" size={13} />
                {new Date(article.created_at.replace(' ', 'T')).toLocaleDateString('fa-IR')}
              </time>
            )}
          <b>
            مطالعه مقاله <Icon name="arrow" size={13} />
          </b>
        </div>
      </div>
    </a>
  )
}
