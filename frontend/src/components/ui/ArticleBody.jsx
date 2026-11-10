import React, { useMemo } from 'react'
import { articleHTML } from '../../utils/articleContent.js'

export default function ArticleBody({ text }) {
  const { html, headings } = useMemo(() => {
    const root = document.createElement('div')
    root.innerHTML = articleHTML(text)
    const headings = [...root.querySelectorAll('h2,h3,h4,h5,h6')].map((heading, index) => {
      heading.id = `article-section-${index + 1}`
      return { id: heading.id, text: heading.textContent, level: Number(heading.tagName[1]) }
    })
    return { html: root.innerHTML, headings }
  }, [text])
  return <>
    {headings.length >= 3 && <details className="article-toc"><summary>در این مقاله می‌خوانید</summary><nav aria-label="فهرست مقاله"><ol>{headings.map((heading) => <li key={heading.id} className={heading.level > 2 ? 'is-subheading' : ''}><a href={`#${heading.id}`}>{heading.text}</a></li>)}</ol></nav></details>}
    <div className="article-rich-text" dangerouslySetInnerHTML={{ __html: html }} />
  </>
}
