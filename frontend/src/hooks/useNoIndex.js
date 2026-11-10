import { useEffect } from 'react'

export default function useNoIndex(active) {
  useEffect(() => {
    if (!active) return
    const previous = ['robots', 'googlebot'].map((name) => {
      let element = document.head.querySelector(`meta[name="${name}"]`)
      const existed = Boolean(element)
      if (!element) { element = document.createElement('meta'); element.name = name; document.head.append(element) }
      const content = element.content
      element.content = 'noindex, follow'
      return { element, content, existed }
    })
    return () => previous.forEach(({ element, content, existed }) => { if (existed) element.content = content; else element.remove() })
  }, [active])
}
