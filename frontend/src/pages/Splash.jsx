import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const fields = [
  { icon: 'ti-stethoscope', label: 'Doctor' },
  { icon: 'ti-tool', label: 'Engineer' },
  { icon: 'ti-school', label: 'Teacher' },
  { icon: 'ti-plane', label: 'Pilot' },
  { icon: 'ti-scale', label: 'Lawyer' },
  { icon: 'ti-palette', label: 'Designer' },
  { icon: 'ti-chart-bar', label: 'Analyst' },
  { icon: 'ti-building', label: 'Architect' },
  { icon: 'ti-heart', label: 'Nurse' },
  { icon: 'ti-flask', label: 'Scientist' },
  { icon: 'ti-coin', label: 'Banker' },
  { icon: 'ti-bulb', label: 'Founder' },
  { icon: 'ti-code', label: 'Developer' },
  { icon: 'ti-camera', label: 'Photographer' },
  { icon: 'ti-microscope', label: 'Researcher' },
  { icon: 'ti-speakerphone', label: 'Marketer' }
]

const positions = [
  [4, 6], [64, 2], [128, 8], [192, 2], [256, 8], [300, 18],
  [0, 58], [78, 52], [150, 56], [222, 52], [296, 58],
  [22, 108], [96, 102], [168, 108], [240, 102], [298, 112]
]

const valueProps = [
  { icon: 'ti-shield-check', text: 'Zero Fake Profiles' },
  { icon: 'ti-route', text: 'AI Career Roadmap' },
  { icon: 'ti-eye-check', text: 'Transparent Hiring' }
]

const motto = 'Your career journey starts here'
const SPLASH_DURATION = 4000

function Splash() {
  const navigate = useNavigate()
  const [poppedCount, setPoppedCount] = useState(0)
  const [mottoText, setMottoText] = useState('')
  const [propIndex, setPropIndex] = useState(-1)
  const [propVisible, setPropVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const redirectTimer = setTimeout(() => navigate('/register'), SPLASH_DURATION)

    let popTimer
    const popInterval = Math.floor((SPLASH_DURATION - 600) / fields.length)
    const popNext = (i) => {
      if (i >= fields.length) return
      setPoppedCount(i + 1)
      popTimer = setTimeout(() => popNext(i + 1), popInterval)
    }
    const popStart = setTimeout(() => popNext(0), 150)

    let mi = 0
    let mottoTimer
    const typeSpeed = Math.floor(1200 / motto.length)
    const typeMotto = () => {
      if (mi <= motto.length) {
        setMottoText(motto.slice(0, mi))
        mi++
        mottoTimer = setTimeout(typeMotto, typeSpeed)
      }
    }
    typeMotto()

    let pi = 0
    let propTimer
    const propDuration = Math.floor((SPLASH_DURATION - 1300) / valueProps.length)
    const showProp = () => {
      if (pi >= valueProps.length) return
      setPropIndex(pi)
      setPropVisible(true)
      propTimer = setTimeout(() => {
        setPropVisible(false)
        pi++
        propTimer = setTimeout(showProp, 100)
      }, propDuration - 100)
    }
    const propStart = setTimeout(showProp, 1300)

    let start = null
    let rafId
    const animateLoad = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      const pct = Math.min(elapsed / SPLASH_DURATION, 1)
      setProgress(pct * 100)
      if (pct < 1) rafId = requestAnimationFrame(animateLoad)
    }
    rafId = requestAnimationFrame(animateLoad)

    return () => {
      clearTimeout(redirectTimer)
      clearTimeout(popTimer)
      clearTimeout(popStart)
      clearTimeout(mottoTimer)
      clearTimeout(propTimer)
      clearTimeout(propStart)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#1A3C6E] flex flex-col items-center justify-center px-6 py-12 overflow-hidden">

      <div className="flex items-center gap-2 mb-1">
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="11" fill="#0D7377" />
          <path d="M6 11.5l3 3l7-7" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <h1 className="text-white text-3xl font-bold">GRID</h1>
      </div>
      <p className="text-[#0D7377] text-sm tracking-wider mb-5 h-4">{mottoText}</p>

      <div className="relative w-full max-w-[340px] h-[175px]">
        {fields.slice(0, poppedCount).map((field, i) => {
          const [x, y] = positions[i % positions.length]
          return (
            <div
              key={field.label}
              className="absolute flex flex-col items-center gap-1 transition-all duration-300"
              style={{ left: x, top: y }}
            >
              <span className="text-[17px] text-[#5DCAA5]" style={{ filter: 'drop-shadow(0 0 4px rgba(93,202,165,0.5))' }}>
                <i className={`ti ${field.icon}`}></i>
              </span>
              <span className="text-[10px] text-[#9FE1CB] font-bold whitespace-nowrap">{field.label}</span>
            </div>
          )
        })}
      </div>

      <div className={`flex items-center gap-2 text-white text-base font-bold h-5 my-4 transition-opacity duration-300 ${propVisible ? 'opacity-100' : 'opacity-0'}`}>
        {propIndex >= 0 ? (
          <>
            <i className={`ti ${valueProps[propIndex].icon}`}></i>
            <span>{valueProps[propIndex].text}</span>
          </>
        ) : null}
      </div>

      <div className="w-full max-w-[260px] h-[3px] bg-white/15 rounded-full overflow-hidden">
        <div className="h-full bg-[#0D7377] rounded-full" style={{ width: `${progress}%` }}></div>
      </div>

    </div>
  )
}

export default Splash
