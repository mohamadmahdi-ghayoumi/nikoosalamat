import React, { useEffect, useRef } from 'react'
import Icon from '../ui/Icon.jsx'

export default function HeaderSearch({ buttonRef, onClose, navigate }) {
  const panelRef = useRef(null)
  useEffect(() => {
    const outside = (event) => {
      if (!panelRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target))
        onClose(false)
    }
    const escape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose(true)
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [buttonRef, onClose])
  return (
    <form
      className="search-panel"
      id="header-search"
      role="search"
      ref={panelRef}
      onSubmit={(event) => {
        event.preventDefault()
        const query = String(new FormData(event.currentTarget).get('q') || '').trim()
        if (query) navigate(event, `/search?q=${encodeURIComponent(query)}`)
      }}
    >
      <input
        autoFocus
        name="q"
        type="search"
        required
        maxLength={120}
        placeholder="جست‌وجوی محصول یا موضوع..."
        aria-label="جست‌وجو در سایت"
      />
      <button type="submit" aria-label="نمایش نتایج جست‌وجو">
        <Icon name="search" size={20} />
      </button>
      <button type="button" onClick={() => onClose(true)} aria-label="بستن جست‌وجو">
        <Icon name="close" size={19} />
      </button>
    </form>
  )
}
