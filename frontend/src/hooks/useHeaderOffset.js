import { useEffect, useRef } from 'react'

export default function useHeaderOffset() {
  const siteHeaderRef = useRef(null)
  useEffect(() => {
    const header = siteHeaderRef.current
    if (!header) return
    const announcement = header.querySelector('.announcement')
    const utilityRow = header.querySelector('.header-inner')
    const updateOffset = () => {
      const offset = announcement.offsetHeight + utilityRow.offsetHeight
      header.style.setProperty('--header-scroll-offset', `${offset}px`)
    }
    const observer = new ResizeObserver(updateOffset)
    observer.observe(announcement)
    observer.observe(utilityRow)
    window.addEventListener('resize', updateOffset)
    updateOffset()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateOffset)
    }
  }, [])
  return siteHeaderRef
}
