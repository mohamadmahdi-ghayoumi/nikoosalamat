import { useCallback, useEffect, useRef, useState } from 'react'

export default function useSlidePlayback({ slideCount, playing, readySlides, duration = 6000 }) {
  const [active, setActive] = useState(0)
  const [pending, setPending] = useState(null)
  const elapsed = useRef(0)
  const progressRef = useRef(null)

  const resetProgress = useCallback(() => {
    elapsed.current = 0
    progressRef.current?.style.setProperty('--slide-progress', '0')
  }, [])

  const select = useCallback(
    (index) => {
      if (index < 0 || index >= slideCount) return
      resetProgress()
      if (readySlides?.[index] === false) {
        setPending(index)
      } else {
        setPending(null)
        setActive(index)
      }
    },
    [resetProgress, readySlides, slideCount],
  )

  const move = useCallback(
    (delta) => {
      select(((pending ?? active) + delta + slideCount) % slideCount)
    },
    [select, pending, active, slideCount],
  )

  useEffect(() => {
    if (pending === null || readySlides?.[pending] === false) return
    setActive(pending)
    setPending(null)
    resetProgress()
  }, [pending, readySlides, resetProgress])

  useEffect(() => {
    if (!playing || pending !== null || slideCount < 2 || readySlides?.[active] === false) return
    let frame
    let previousTime = performance.now()

    const tick = (now) => {
      elapsed.current += now - previousTime
      previousTime = now

      if (elapsed.current >= duration) {
        const next = (active + 1) % slideCount
        if (readySlides?.[next] === false) {
          progressRef.current?.style.setProperty('--slide-progress', '1')
          setPending(next)
        } else {
          resetProgress()
          setActive(next)
        }
        return
      }

      // One clock drives both the bar and slide changes, without re-rendering
      // the image/text tree on every animation frame. Pauses retain elapsed time.
      progressRef.current?.style.setProperty('--slide-progress', String(elapsed.current / duration))
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [playing, pending, slideCount, duration, active, readySlides, resetProgress])

  return { active, pending, select, move, progressRef }
}
