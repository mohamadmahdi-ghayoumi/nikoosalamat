import { useCallback, useEffect, useRef, useState } from 'react'

export default function useHeroImages(slides) {
  const [statuses, setStatuses] = useState(() => slides.map(() => 'idle'))
  const requests = useRef([])
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const requestImage = useCallback(
    (index, force = false, priority = 'low') => {
      const previous = requests.current[index]
      if (!force && ['loading', 'ready'].includes(previous?.status)) {
        if (priority === 'high') previous.image.fetchPriority = 'high'
        return
      }
      const image = new Image()
      const request = { image, status: 'loading' }
      requests.current[index] = request
      const update = (status) => {
        if (requests.current[index] !== request) return
        request.status = status
        if (mounted.current) {
          setStatuses((current) => current.map((value, item) => (item === index ? status : value)))
        }
      }
      update('loading')
      const timeout = window.setTimeout(() => update('error'), 15000)
      image.decoding = 'async'
      image.fetchPriority = priority
      image.onload = async () => {
        window.clearTimeout(timeout)
        try {
          await image.decode()
          update('ready')
        } catch {
          update(image.naturalWidth > 0 ? 'ready' : 'error')
        }
      }
      image.onerror = () => {
        window.clearTimeout(timeout)
        update('error')
      }
      image.src = slides[index].image
    },
    [slides],
  )

  return { statuses, requestImage }
}
