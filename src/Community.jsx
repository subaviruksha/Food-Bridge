
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const panel = 'rounded-3xl border border-line bg-white shadow-[0_14px_40px_rgba(20,20,20,.06)]'

const DRIVES = [
  { code: 'FB-014', t: 'Sunday Surplus Run', a: 'RS Puram', when: 'Sun, 8 Nov · 6 pm', need: 12, joined: 9, ic: '🛵', tag: 'NEAR CAPACITY', tagCls: 'bg-tomato-soft text-tomato', chip: 'bg-tomato-soft', bar: 'bg-tomato' },
  { code: 'FB-021', t: 'Wedding Hall Rescue', a: 'Peelamedu', when: 'Sat, 14 Nov · 10 pm', need: 8, joined: 3, ic: '🍽️', tag: 'OPEN MISSION', tagCls: 'bg-sky-soft text-sky', chip: 'bg-sky-soft', bar: 'bg-sky' },
  { code: 'FB-028', t: 'Campus Canteen Drive', a: 'Gandhipuram', when: 'Fri, 20 Nov · 4 pm', need: 20, joined: 14, ic: '🎓', tag: 'VOLUNTEERS NEEDED', tagCls: 'bg-saffron-soft text-saffron-deep', chip: 'bg-saffron-soft', bar: 'bg-saffron' },
]

const FEED = [
  'Meena picked up 30 meals in Saibaba Colony',
  'A hotel listed 55 fresh plates near Race Course',
  'Anbu Illam claimed 40 available meals',
  '120 people received meals in Ukkadam tonight',
  'Karthik joined the Sunday Surplus Run',
]

export default function Community() {
  const [mine, setMine] = useState({})
  const [meals, setMeals] = useState(40)
  const [pledged, setPledged] = useState(false)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % FEED.length)
    }, 2800)

    return () => clearInterval(id)
  }, [])

  return (
    <div className="mt-12 space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.35fr_.85fr]">

        {/* Volunteer missions */}
        <div className={`${panel} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-ink/55">
                Dispatch board · 03 active
              </p>
              <h3 className="mt-1 text-xl">Neighbourhood rescue missions</h3>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-leaf-soft px-3 py-1.5 text-[11px] font-semibold tracking-widest text-leaf">
              <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" />
              ACCEPTING HELP
            </span>
          </div>

          <div className="grid gap-3 p-4 sm:p-5">
            {DRIVES.map((d, i) => {
              const joined = d.joined + (mine[i] ? 1 : 0)
              const percent = Math.min(100, joined / d.need * 100)

              return (
                <motion.article
                  key={d.code}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-line bg-mist/60 p-5 transition-colors hover:border-ink/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ${d.chip}`}>
                        {d.ic}
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold tracking-[.18em] text-ink/55">
                          MISSION {d.code}
                        </p>
                        <h4 className="mt-1 text-lg">{d.t}</h4>
                        <p className="mt-1 text-sm text-ink/75">
                          {d.a} <span className="px-1 text-ink/40">·</span> {d.when}
                        </p>
                      </div>
                    </div>

                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-widest ${d.tagCls}`}>
                      {d.tag}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink/70">Volunteer deployment</span>
                    <span className="tabular-nums text-ink">
                      {joined} <span className="text-ink/40">/ {d.need}</span>
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
                    <motion.div
                      className={`h-full rounded-full ${d.bar}`}
                      animate={{ width: `${percent}%` }}
                      transition={{ type: 'spring', stiffness: 75 }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-ink/65">
                      {Math.max(0, d.need - joined)} volunteer slots remaining
                    </span>

                    <button
                      onClick={() => setMine((m) => ({ ...m, [i]: !m[i] }))}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 ${
                        mine[i]
                          ? 'border border-leaf bg-leaf-soft text-leaf'
                          : 'bg-leaf text-white shadow-md shadow-leaf/20'
                      }`}
                    >
                      {mine[i] ? 'MISSION JOINED ✓' : 'JOIN MISSION ↗'}
                    </button>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>

        {/* Community contribution */}
        <div className={`${panel} relative flex flex-col overflow-hidden p-6`}>
          <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-saffron-deep">
            Community contribution
          </p>

          <h3 className="mt-2 text-2xl">Fuel the next meal.</h3>

          <p className="mt-2 text-sm leading-6 text-ink/70">
            Choose how many meals you want to help put on the table.
          </p>

          <div className="mt-7 rounded-2xl border border-saffron/40 bg-saffron-soft p-5">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-ink/60">
                  Meals supported
                </span>

                <div className="mt-1 font-display text-6xl tracking-tight text-saffron-deep">
                  {meals}
                </div>
              </div>

              <span className="mb-2 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-leaf">
                ≈ {Math.round(meals * .4)} kg saved
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={meals}
              onChange={(e) => {
                setMeals(+e.target.value)
                setPledged(false)
              }}
              className="mt-6 w-full accent-[#F29A1F]"
              aria-label="Number of meals"
            />

            <div className="mt-2 flex justify-between text-[11px] text-ink/55">
              <span>5 meals</span>
              <span>200 meals</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-ink/70">Estimated contribution</span>
            <b className="font-display text-2xl font-normal text-ink">
              ₹{(meals * 25).toLocaleString('en-IN')}
            </b>
          </div>

          <button
            onClick={() => setPledged(true)}
            className="mt-5 rounded-full bg-leaf px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:-translate-y-0.5 hover:bg-leaf-deep"
          >
            {pledged ? `✓ ${meals} MEALS PLEDGED` : 'PLEDGE MEALS ↗'}
          </button>

          <small className="mt-3 text-center text-[11px] text-ink/55">
            Demo estimate · ₹25 per meal
          </small>
        </div>
      </div>

      {/* Network activity */}
      <div className={`${panel} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-ink/55">
              Network activity
            </p>
            <h3 className="mt-1 text-lg">
              Across the FoodBridge community
            </h3>
          </div>

          <span className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-leaf">
            <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" />
            LIVE FEED · DEMO
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {[0, 1, 2].map((k) => (
              <motion.div
                layout
                key={idx + k}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1 - k * 0.15, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex min-h-[68px] items-center gap-3 rounded-xl border-2 border-line bg-white px-3 py-3 shadow-sm"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-leaf-soft text-sm font-semibold text-leaf">
                  ↗
                </span>

                <p className="text-[13px] font-medium leading-5 text-ink">
                  {FEED[(idx + k) % FEED.length]}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
