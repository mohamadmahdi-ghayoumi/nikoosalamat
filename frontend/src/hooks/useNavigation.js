import { useCallback, useEffect, useState } from 'react'

export default function useNavigation() {
  const [currentPath, setCurrentPath] = useState(
    () => window.location.pathname.replace(/\/$/, '') || '/',
  )
  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname.replace(/\/$/, '') || '/')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const navigate = useCallback((event, target) => {
    event?.preventDefault()
    if (window.location.pathname !== target) window.history.pushState({}, '', target)
    setCurrentPath(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  return { currentPath, navigate }
}
