import React from 'react'
import { articleHTML } from '../../utils/articleContent.js'

export default function ContentBody({ text }) {
  return <div className="article-rich-text" dangerouslySetInnerHTML={{ __html: articleHTML(text) }} />
}
