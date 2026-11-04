import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createHistoryEntry,
  getHistoryEntry,
  saveHistoryScroll,
} from '../utils/navigationHistory.js'

const readUrl = () => window.location.pathname + window.location.search + window.location.hash

export default function useNavigation() {
  const [location, setLocation] = useState(() => ({
    url: readUrl(),
    entry: getHistoryEntry(),
    action: window.history.state?.nikoNavigation?.scroll?.y ? 'restore' : 'navigate',
    revision: 0,
  }))
  const activeKey = useRef(location.entry.key)
  const currentUrl = useRef(location.url)
  const restoring = useRef(false)
  const saveTimer = useRef(null)
  const positions = useRef(new Map([[location.entry.key, location.entry.scroll]]))
  const savePosition = useCallback(() => {
    clearTimeout(saveTimer.current)
    saveTimer.current = null
    if (!restoring.current) {
      positions.current.set(activeKey.current, { x: window.scrollX, y: window.scrollY })
      saveHistoryScroll(activeKey.current)
    }
  }, [])
  const url = new URL(location.url, window.location.origin)
  const currentPath = url.pathname.replace(/\/$/, '') || '/'

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const onScroll = () => {
      if (restoring.current) return
      positions.current.set(activeKey.current, { x: window.scrollX, y: window.scrollY })
      // Avoid frequent History API writes, which are rate-limited in some mobile browsers.
      if (saveTimer.current === null) saveTimer.current = window.setTimeout(savePosition, 500)
    }
    const update = (action) => {
      clearTimeout(saveTimer.current)
      saveTimer.current = null
      const nextUrl = readUrl()
      if (action === 'hash' && nextUrl === currentUrl.current) return
      const stored = getHistoryEntry()
      const entry = { ...stored, scroll: positions.current.get(stored.key) || stored.scroll }
      activeKey.current = entry.key
      currentUrl.current = nextUrl
      restoring.current = action === 'restore'
      setLocation((previous) => ({ url: nextUrl, entry, action, revision: previous.revision + 1 }))
    }
    const pop = () => update('restore')
    const hash = () => update('hash')
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', savePosition)
    window.addEventListener('popstate', pop)
    window.addEventListener('hashchange', hash)
    return () => {
      savePosition()
      window.history.scrollRestoration = previousRestoration
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', savePosition)
      window.removeEventListener('popstate', pop)
      window.removeEventListener('hashchange', hash)
      clearTimeout(saveTimer.current)
    }
  }, [savePosition])

  useEffect(() => {
    let timer
    let observer
    let stopped = false
    let attempts = 0
    const stopRestore = () => {
      if (stopped) return
      stopped = true
      clearTimeout(timer)
      observer?.disconnect()
      restoring.current = false
      positions.current.set(location.entry.key, { x: window.scrollX, y: window.scrollY })
      saveHistoryScroll(location.entry.key)
    }
    const restore = () => {
      if (stopped || activeKey.current !== location.entry.key) return
      const { x, y } = location.entry.scroll
      window.scrollTo({ left: x, top: y, behavior: 'instant' })
    }
    const scroll = () => {
      if (location.action === 'restore') {
        restoring.current = true
        restore()
        observer = new ResizeObserver(restore)
        observer.observe(document.body)
        timer = window.setTimeout(stopRestore, 6000)
        return
      }
      restoring.current = false
      const hash = new URL(location.url, window.location.origin).hash.slice(1)
      let targetId = hash
      try {
        targetId = decodeURIComponent(hash)
      } catch {
        /* Keep malformed fragments harmless. */
      }
      const target = hash && document.getElementById(targetId)
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth'
      if (target) target.scrollIntoView({ behavior, block: 'start' })
      else if (hash && attempts++ < 100) timer = window.setTimeout(scroll, 50)
      else window.scrollTo({ top: 0, behavior })
    }
    const frame = requestAnimationFrame(scroll)
    const interrupt = () => {
      if (location.action === 'restore') stopRestore()
    }
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown'])
      window.addEventListener(event, interrupt, { passive: true })
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      observer?.disconnect()
      for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown'])
        window.removeEventListener(event, interrupt)
    }
  }, [location])

  const navigate = useCallback(
    (event, target) => {
      if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
      const targetUrl = new URL(target, window.location.origin)
      if (targetUrl.origin !== window.location.origin) return
      event?.preventDefault()
      savePosition()
      const nextUrl = targetUrl.pathname + targetUrl.search + targetUrl.hash
      if (readUrl() !== nextUrl)
        window.history.pushState({ nikoNavigation: createHistoryEntry() }, '', nextUrl)
      const entry = getHistoryEntry()
      activeKey.current = entry.key
      currentUrl.current = nextUrl
      restoring.current = false
      setLocation((previous) => ({
        url: nextUrl,
        entry,
        action: 'navigate',
        revision: previous.revision + 1,
      }))
    },
    [savePosition],
  )
  return { currentPath, currentSearch: url.search, navigate }
}
