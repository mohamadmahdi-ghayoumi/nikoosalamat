import React, { useMemo } from 'react'
import { articleHTML } from '../../utils/articleContent.js'

export default function ArticleBody({ text }) {
  const html = useMemo(() => articleHTML(text), [text])
  return <div className="article-rich-text" dangerouslySetInnerHTML={{ __html: html }} />
}
