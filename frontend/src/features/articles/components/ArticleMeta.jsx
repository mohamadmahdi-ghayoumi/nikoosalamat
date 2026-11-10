import React from 'react'
import { articlePlainText } from '../../../utils/articleContent.js'

export default function ArticleMeta({ article }) {
  const minutes = Math.max(
    1,
    Math.ceil(
      articlePlainText(article.body || article.excerpt || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length / 200,
    ),
  )
  const published = article.created_at ? new Date(article.created_at.replace(' ', 'T')) : null
  return (
    <div className="article-meta">
      <span>{new Intl.NumberFormat('fa-IR').format(minutes)} دقیقه مطالعه</span>
      {published && !Number.isNaN(published.getTime()) && (
        <time dateTime={published.toISOString()}>
          {new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(published)}
        </time>
      )}
    </div>
  )
}
