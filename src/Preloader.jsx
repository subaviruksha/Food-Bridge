import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ARC = 'M44 104 Q160 -36 276 104'

export default function Preloader() {
  const [show, setShow] = useState(true)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const MIN = reduce ? 400 : 2600 // shortest time the screen stays up (ms)
    const start = performance.now()
    let loaded = document.readyState === 'complete'
    let done = false
    const onLoad = () => { loaded = true }
    window.addEventListener('load', onLoad)
    document.body.style.overflow = 'hidden' // no scrolling behind the loader

    let raf
    const tick = (now) => {
      if (done) return
      const t = Math.min(1, (now - start) / MIN)
      const eased = 1 - Math.pow(1 - t, 3)
      // wait at 92% until the page has really finished loading
      setPct(Math.round(Math.min(loaded ? 100 : 92, eased * 100)))
      if (t >= 1 && loaded) { done = true; setShow(false) }
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // safety: never keep visitors waiting more than 7 seconds
    const safety = setTimeout(() => { done = true; setShow(false) }, 7000)

    return () => {
      done = true
      cancelAnimationFrame(raf)
      clearTimeout(safety)
      window.removeEventListener('load', onLoad)
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => { if (!show) document.body.style.overflow = '' }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading FoodBridge"
          className="fixed inset-0 z-[100] grid place-items-center bg-[#FBFAF7]"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex w-full max-w-sm flex-col items-center px-6 text-center">
            <svg viewBox="0 0 320 150" className="w-full max-w-[320px]" aria-hidden="true">
              <line x1="0" y1="124" x2="320" y2="124" className="stroke-ink/15" strokeWidth="2" />

              {/* restaurant */}
              <rect x="14" y="88" width="46" height="36" rx="4" className="fill-tomato" />
              <polygon points="10,90 37,70 64,90" className="fill-ink" />
              <rect x="32" y="104" width="10" height="20" className="fill-white" />

              {/* shelter */}
              <rect x="260" y="88" width="46" height="36" rx="4" className="fill-leaf" />
              <polygon points="256,90 283,70 310,90" className="fill-ink" />
              <rect x="278" y="104" width="10" height="20" className="fill-white" />

              {/* the bridge draws itself */}
              <path d={ARC} fill="none" className="stroke-ink/15" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
              <motion.path
                d={ARC}
                fill="none"
                className="stroke-leaf"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />

              {/* the food box travelling across */}
              <g>
                <rect x="-8" y="-8" width="16" height="16" rx="3" className="fill-saffron" />
                <rect x="-8" y="-2" width="16" height="4" className="fill-white/70" />
                <animateMotion dur="1.8s" begin="0.5s" repeatCount="indefinite" path={ARC} />
              </g>
            </svg>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="mt-2 font-display text-4xl tracking-tight text-ink"
            >
              Food<span className="text-leaf">Bridge</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/55"
            >
              Surplus food, safely shared
            </motion.p>

            <div className="mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-leaf transition-[width] duration-100 ease-out" style={{ width: `${pct}%` }} />
            </div>
            <span className="mt-2 text-xs font-semibold text-ink/50" style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}