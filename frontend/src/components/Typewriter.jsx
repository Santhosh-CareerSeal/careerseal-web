import { useState, useEffect } from 'react'

// Types text out word-by-word. When animate is false (e.g. a saved roadmap on
// revisit) or the viewer prefers reduced motion, it shows the full text at once.
function Typewriter({ text = '', animate = true, speed = 30, className = '' }) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const doAnimate = animate && !prefersReduced

  const [shown, setShown] = useState(doAnimate ? '' : text)
  const [done, setDone] = useState(!doAnimate)

  useEffect(() => {
    if (!doAnimate) { setShown(text); setDone(true); return }
    setShown(''); setDone(false)
    const words = text.split(' ')
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(words.slice(0, i).join(' '))
      if (i >= words.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text, doAnimate, speed])

  return (
    <span className={className}>
      {shown}
      {!done && <span className="tw-cursor">▋</span>}
    </span>
  )
}

export default Typewriter
