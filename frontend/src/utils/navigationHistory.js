export function createHistoryEntry() {
  const key =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return { key, scroll: { x: 0, y: 0 } }
}

export function getHistoryEntry() {
  if (window.history.state?.nikoNavigation?.key) return window.history.state.nikoNavigation
  const entry = createHistoryEntry()
  window.history.replaceState({ ...window.history.state, nikoNavigation: entry }, '')
  return entry
}

export function saveHistoryScroll(key) {
  const entry = window.history.state?.nikoNavigation
  if (entry?.key !== key) return
  window.history.replaceState(
    {
      ...window.history.state,
      nikoNavigation: { ...entry, scroll: { x: window.scrollX, y: window.scrollY } },
    },
    '',
  )
}
