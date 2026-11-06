import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'

/* Avatar colours follow the role: FoodBridge = green, restaurant = saffron, shelter = blue, volunteer = red */
const MSGS = [
  { who: 'FoodBridge', c: 'bg-leaf text-white', t: '🔔 40 plates of biryani listed 1.2 km away.' },
  { who: 'Asha · Shelter', c: 'bg-sky text-white', t: 'We’ll take it! Sixty children are waiting for dinner.' },
  { who: 'Sruthi · Volunteer', c: 'bg-tomato text-white', t: 'Picked up 🛵 I deliver on my way home, and I know exactly who I helped.' },
  { who: 'Ravi · Restaurant', c: 'bg-saffron text-ink', t: 'We used to bin forty portions every Sunday. Now they’re on a plate by 10 pm.' },
  { who: 'Asha · Shelter', c: 'bg-sky text-white', t: 'A message at 9 pm, a volunteer at 9:30, and sixty children fed. It changed our week.' },
  { who: 'FoodBridge', c: 'bg-leaf text-white', t: '🍛 60 meals served tonight. Thank you, bridge builders!' },
]

/*
  Photos of the people. Put the pictures in the public/ folder with these names
  (square photos, at least 400 x 400 px; the face is zoomed in automatically,
  add `pos: '50% 10%'` to a person if a face is cut off).
  Until a file exists, the coloured initial shows instead.
*/
const PEOPLE = [
  { name: 'Ravi', role: 'Restaurant owner', src: '/ravi.jpg', c: 'bg-saffron text-ink', ring: 'ring-saffron' },
  { name: 'Sruthi', role: 'Volunteer driver', src: '/sruthi.jpg', c: 'bg-tomato text-white', ring: 'ring-tomato' },
  { name: 'Asha', role: 'Shelter coordinator', src: '/asha.jpg', c: 'bg-sky text-white', ring: 'ring-sky' },
]

function Avatar({ p }) {
  const [ok, setOk] = useState(true)
  return (
    <span className={`relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full font-display text-4xl shadow-md ring-4 ring-offset-2 ${p.ring} ${p.c}`}>
      {p.name[0]}
      {ok && <img src={p.src} alt={`${p.name}, ${p.role}`} loading="lazy" onError={() => setOk(false)} style={{ objectPosition: p.pos || '50% 8%' }} className="absolute inset-0 h-full w-full scale-[1.08] object-cover" />}
    </span>
  )
}

export default function StoriesPhone() {
  const [n, setN] = useState(0)
  const [typing, setTyping] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })

  useEffect(() => {
    if (!inView) return
    let id
    if (n < MSGS.length) {
      setTyping(true)
      id = setTimeout(() => { setTyping(false); setN(n + 1) }, 1400)
    } else {
      id = setTimeout(() => setN(0), 3500)
    }
    return () => clearTimeout(id)
  }, [n, inView])

  const nextLeft = n % 2 === 0
  return (
    <div ref={ref} className="mt-12 grid items-center gap-12 lg:grid-cols-2">
      <div className="space-y-4">
        {PEOPLE.map((p) => (
          <div key={p.name} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-[0_8px_24px_rgba(20,20,20,.05)]">
            <Avatar p={p} />
            <div><b className="text-lg text-ink">{p.name}</b><small className="block text-muted">{p.role}</small></div>
          </div>
        ))}
        <p className="max-w-md">Here’s an example of how a food donation could work: a restaurant posts extra meals, a volunteer collects them, and a local shelter receives them.</p>
      </div>

      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="relative mx-auto h-[600px] w-[300px] rounded-[2.8rem] border-[10px] border-ink bg-ink shadow-[0_30px_70px_rgba(20,20,20,.28)]">
        <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-ink" />
        <div className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#F4F2EC]">
          <div className="flex items-center gap-3 border-b border-line bg-white px-4 pb-3 pt-9">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf-soft">🌉</span>
            <div className="leading-tight"><b className="text-sm text-ink">FoodBridge community</b><small className="block text-xs font-medium text-leaf">● 128 online</small></div>
          </div>
          <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden p-3">
            {MSGS.slice(0, n).map((m, i) => {
              const left = i % 2 === 0
              return (
                <motion.div layout key={i} initial={{ opacity: 0, x: left ? -80 : 80 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 16 }}
                  className={`flex items-end gap-2 ${left ? '' : 'flex-row-reverse'}`}>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${m.c}`}>{m.who[0]}</span>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-snug ${left ? 'rounded-bl-sm border border-line bg-white text-ink' : 'rounded-br-sm bg-leaf text-white'}`}>
                    <b className="block text-[11px] opacity-70">{m.who}</b>{m.t}
                  </div>
                </motion.div>
              )
            })}
            <AnimatePresence>
              {typing && n < MSGS.length && (
                <motion.div layout key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex ${nextLeft ? '' : 'justify-end'}`}>
                  <div className="flex gap-1 rounded-2xl border border-line bg-white px-3 py-2">
                    {[0, 1, 2].map((d) => <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-ink/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="m-3 rounded-full border border-line bg-white px-4 py-2 text-sm text-ink/45">Message the bridge…</div>
        </div>
      </motion.div>
    </div>
  )
}