import { useCallback, useEffect, useRef, useState } from 'react'

export const desktopNavigation = () =>
  window.matchMedia('(min-width: 961px) and (hover: hover)').matches

export default function useHeaderMenus(currentPath) {
  const navigationRef = useRef(null)
  const mobileToggleRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openPath, setOpenPath] = useState([])
  const closeMenus = useCallback(() => {
    setMenuOpen(false)
    setOpenPath([])
  }, [])

  useEffect(closeMenus, [currentPath, closeMenus])

  useEffect(() => {
    const outside = (event) => {
      if (
        !navigationRef.current?.contains(event.target) &&
        !mobileToggleRef.current?.contains(event.target)
      )
        closeMenus()
    }
    const escape = (event) => {
      if (event.key !== 'Escape') return
      const active = document.activeElement
      const root = active?.closest('.nav-depth-0.expanded')
      const toggle = root?.querySelector(':scope > .nav-row > .submenu-toggle')
      if (navigationRef.current?.contains(active) && !desktopNavigation()) {
        mobileToggleRef.current?.focus()
      } else if (toggle) toggle.focus()
      closeMenus()
    }
    const breakpoint = window.matchMedia('(min-width: 961px)')
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    breakpoint.addEventListener('change', closeMenus)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
      breakpoint.removeEventListener('change', closeMenus)
    }
  }, [closeMenus])

  return {
    navigationRef,
    mobileToggleRef,
    menuOpen,
    setMenuOpen,
    openPath,
    setOpenPath,
    closeMenus,
  }
}
