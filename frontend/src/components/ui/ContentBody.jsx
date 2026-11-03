import React from 'react'

export default function ContentBody({ text }) {
  return String(text || '')
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>)
}
