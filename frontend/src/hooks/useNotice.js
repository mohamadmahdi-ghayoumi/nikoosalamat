import { useCallback, useEffect, useRef, useState } from 'react'

export default function useNotice() {
  const [notice, setNotice] = useState('')
  const timer = useRef(null)
  const showNotice = useCallback((message) => {
    setNotice(message)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setNotice(''), 2600)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return { notice, showNotice }
}
