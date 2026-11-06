import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useInView } from 'framer-motion'

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
const STORIES = [
  {
    name: 'Ravi', role: 'Restaurant owner', src: '/ravi.jpg',
    quote: '“We used to bin forty portions every Sunday. Now they’re on a plate by 10 pm.”',
    stat: 40, label: 'portions shared instead of binned',
    steps: [['🍱', '9:00 pm', 'Lists 40 plates'], ['🔔', '9:05 pm', 'Shelter accepts'], ['🍛', '10:00 pm', 'Food on the table']],
    c: 'bg-saffron text-ink', ring: 'ring-saffron', bar: 'bg-saffron', soft: 'bg-saffron-soft', text: 'text-saffron-deep', border: 'border-t-saffron',
  },
  {
    name: 'Sruthi', role: 'Volunteer driver', src: '/sruthi.jpg',
    quote: '“I deliver on my way home. Twenty minutes, and I know exactly who I helped.”',
    stat: 20, label: 'minutes for one pickup',
    steps: [['🔔', '9:10 pm', 'Pickup alert arrives'], ['🛵', '9:30 pm', 'Collects the food'], ['🏠', '9:50 pm', 'Delivers to the shelter']],
    c: 'bg-tomato text-white', ring: 'ring-tomato', bar: 'bg-tomato', soft: 'bg-tomato-soft', text: 'text-tomato', border: 'border-t-tomato',
  },
  {
    name: 'Asha', role: 'Shelter coordinator', src: '/asha.jpg',
    quote: '“A message at 9 pm, a volunteer at 9:30, and sixty children fed. It changed our week.”',
    stat: 60, label: 'children fed in one evening',
    steps: [['🔔', '9:00 pm', 'Donation alert'], ['🙋', '9:30 pm', 'Volunteer arrives'], ['🍛', '10:00 pm', 'Sixty children fed']],
    c: 'bg-sky text-white', ring: 'ring-sky', bar: 'bg-sky', soft: 'bg-sky-soft', text: 'text-sky', border: 'border-t-sky',
  },
]

function Avatar({ p, size = 'h-28 w-28 text-4xl' }) {
  const [ok, setOk] = useState(true)
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full font-display shadow-md ring-4 ring-offset-2 ${size} ${p.ring} ${p.c}`}>
      {p.name[0]}
      {ok && <img src={p.src} alt={`${p.name}, ${p.role}`} loading="lazy" onError={() => setOk(false)} style={{ objectPosition: p.pos || '50% 8%' }} className="absolute inset-0 h-full w-full scale-[1.08] object-cover" />}
    </span>
  )
}

function StatNumber({ to }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = animate(0, to, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) },
    })
    return () => c.stop()
  }, [to])
  return <span ref={ref}>0</span>
}

const SLIDE_MS = 7000

export default function StoriesPhone() {
  const [n, setN] = useState(0)
  const [typing, setTyping] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })

  /* phone chat */
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

  /* story cards advance on their own; clicking a tab restarts the timer */
  useEffect(() => {
    if (!inView) return
    const id = setTimeout(() => setActive((a) => (a + 1) % STORIES.length), SLIDE_MS)
    return () => clearTimeout(id)
  }, [active, inView])

  const s = STORIES[active]
  const nextLeft = n % 2 === 0

  return (
    <div ref={ref} className="mt-12 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
      {/* ---------- story cards ---------- */}
      <div>
        <div className="grid grid-cols-3 gap-3" role="tablist" aria-label="Community stories">
          {STORIES.map((p, i) => (
            <button
              key={p.name}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`relative overflow-hidden rounded-2xl border p-3 text-left transition sm:p-4 ${i === active ? 'border-ink bg-white shadow-[0_10px_28px_rgba(20,20,20,.10)]' : 'border-line bg-mist hover:bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <Avatar p={p} size="h-11 w-11 text-lg" />
                <div className="min-w-0 hidden sm:block">
                  <b className="block truncate text-base text-ink">{p.name}</b>
                  <small className="block truncate text-muted">{p.role}</small>
                </div>
              </div>
              <b className="mt-2 block text-sm text-ink sm:hidden">{p.name}</b>
              {i === active && inView && (
                <motion.span key={active} className={`absolute bottom-0 left-0 h-1 ${p.bar}`} initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }} />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={s.name}
            role="tabpanel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className={`relative mt-4 overflow-hidden rounded-3xl border border-line border-t-[6px] bg-white p-6 shadow-[0_18px_44px_rgba(20,20,20,.08)] sm:p-8 ${s.border}`}
          >
            <span aria-hidden="true" className="pointer-events-none absolute -top-2 right-5 font-display text-[8rem] leading-none text-ink/[0.06]">“</span>

            <div className="relative flex items-center gap-4">
              <Avatar p={s} size="h-20 w-20 text-3xl" />
              <div>
                <b className="block font-display text-xl text-ink">{s.name}</b>
                <small className="text-muted">{s.role}</small>
              </div>
            </div>

            <blockquote className="relative mt-6 font-display text-2xl leading-snug text-ink sm:text-[1.7rem]">{s.quote}</blockquote>

            <div className="relative mt-7 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className={`rounded-2xl px-6 py-4 ${s.soft}`}>
                <b className={`block font-display text-5xl leading-none ${s.text}`}><StatNumber key={s.name} to={s.stat} /></b>
                <span className="mt-1 block text-sm font-semibold text-ink/70">{s.label}</span>
              </div>

              <ol className="grid grid-cols-3 gap-2">
                {s.steps.map(([ic, time, text], i) => (
                  <li key={time} className="relative rounded-xl border border-line bg-mist p-3 text-center">
                    <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-white text-lg shadow-sm">{ic}</span>
                    <b className="mt-2 block text-xs text-ink">{time}</b>
                    <span className="block text-xs leading-4 text-muted">{text}</span>
                    {i < 2 && <span aria-hidden="true" className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-ink/30 sm:block">›</span>}
                  </li>
                ))}
              </ol>
            </div>
          </motion.article>
        </AnimatePresence>

        <p className="mt-4 max-w-md text-sm leading-6">These are illustrative stories that show how a donation could move through FoodBridge.</p>
      </div>

      {/* ---------- phone chat ---------- */}
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