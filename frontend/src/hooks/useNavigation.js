import { useCallback, useEffect, useState } from 'react'

export default function useNavigation() {
  const readLocation = () =>
    window.location.pathname + window.location.search + window.location.hash
  const [location, setLocation] = useState(() => ({ url: readLocation(), revision: 0 }))
  const currentPath =
    new URL(location.url, window.location.origin).pathname.replace(/\/$/, '') || '/'
  useEffect(() => {
    const onPopState = () =>
      setLocation((previous) => ({ url: readLocation(), revision: previous.revision + 1 }))
    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onPopState)
    }
  }, [])
  useEffect(() => {
    let timer
    let attempts = 0
    const scroll = () => {
      const hash = new URL(location.url, window.location.origin).hash.slice(1)
      let targetId = hash
      try {
        targetId = decodeURIComponent(hash)
      } catch {
        // An invalid URL fragment should not interrupt normal page navigation.
      }
      const target = hash && document.getElementById(targetId)
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth'
      if (target) target.scrollIntoView({ behavior, block: 'start' })
      else if (hash && attempts++ < 20) timer = window.setTimeout(scroll, 50)
      else window.scrollTo({ top: 0, behavior })
    }
    const frame = requestAnimationFrame(scroll)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [location])
  const navigate = useCallback((event, target) => {
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
    const url = new URL(target, window.location.origin)
    if (url.origin !== window.location.origin) return
    event?.preventDefault()
    const nextUrl = url.pathname + url.search + url.hash
    if (window.location.pathname + window.location.search + window.location.hash !== nextUrl)
      window.history.pushState({}, '', nextUrl)
    setLocation((previous) => ({ url: nextUrl, revision: previous.revision + 1 }))
  }, [])
  return { currentPath, navigate }
}
