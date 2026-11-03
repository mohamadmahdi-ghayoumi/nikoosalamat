import { useCallback, useEffect, useRef, useState } from 'react'

export default function useSlidePlayback({ slideCount, playing, duration = 6000 }) {
  const [active, setActive] = useState(0)
  const elapsed = useRef(0)
  const progressRef = useRef(null)

  const resetProgress = useCallback(() => {
    elapsed.current = 0
    progressRef.current?.style.setProperty('--slide-progress', '0')
  }, [])

  const select = useCallback(
    (index) => {
      resetProgress()
      setActive(index)
    },
    [resetProgress],
  )

  const move = useCallback(
    (delta) => {
      resetProgress()
      setActive((index) => (index + delta + slideCount) % slideCount)
    },
    [resetProgress, slideCount],
  )

  useEffect(() => {
    if (!playing || slideCount < 2) return
    let frame
    let previousTime = performance.now()

    const tick = (now) => {
      elapsed.current += now - previousTime
      previousTime = now

      if (elapsed.current >= duration) {
        elapsed.current = 0
        setActive((index) => (index + 1) % slideCount)
      }

      // One clock drives both the bar and slide changes, without re-rendering
      // the image/text tree on every animation frame. Pauses retain elapsed time.
      progressRef.current?.style.setProperty('--slide-progress', String(elapsed.current / duration))
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [playing, slideCount, duration])

  return { active, select, move, progressRef }
}
