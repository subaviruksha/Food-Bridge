
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, animate, useInView } from 'framer-motion'
import Community from './Community.jsx'
import StoriesPhone from './StoriesPhone.jsx'
import FeatureVisual from './FeatureVisual.jsx'
import Scene from './Scene.jsx'
import Preloader from './Preloader.jsx'

const How3D = lazy(() => import('./How3D.jsx'))
const DonationThanks = lazy(() => import('./DonationThanks.jsx'))

const card = 'rounded-3xl border border-line bg-white shadow-[0_10px_30px_rgba(20,20,20,.05)]'

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  )
}

function Counter({ to, suffix = '', align = 'center' }) {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true })
  const final = Math.round(to).toLocaleString('en-IN') + suffix

  useEffect(() => {
    if (!seen) return

    const c = animate(0, to, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = Math.round(v).toLocaleString('en-IN') + suffix
        }
      },
    })

    return () => c.stop()
  }, [seen, to, suffix])

  return (
    <span className="relative inline-block whitespace-nowrap" style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>
      <span aria-hidden="true" className="invisible">{final}</span>
      <span ref={ref} aria-hidden="true" className={`absolute inset-y-0 ${align === 'left' ? 'left-0 text-left' : 'inset-x-0 text-center'}`}>
        0{suffix}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  )
}

function Section({ id, title, lead, eyebrow, tone = 'white', children }) {
  return (
    <section id={id} className={`relative px-4 py-16 sm:px-6 sm:py-20 md:py-28 ${tone === 'mist' ? 'bg-mist' : 'bg-white'}`}>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">{eyebrow}</p>}
          <h2 className="max-w-3xl text-3xl leading-[1.12] md:text-5xl">{title}</h2>
          {lead && <p className="mt-4 max-w-2xl text-base leading-7 md:text-lg">{lead}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  )
}

const problemStats = [
  { n: '1/3', t: 'of all food produced worldwide is lost or wasted.', text: 'text-tomato', bar: 'bg-tomato' },
  { n: '190M', t: 'people in India go undernourished every year.', text: 'text-saffron-deep', bar: 'bg-saffron' },
  { n: '8%', t: 'of global greenhouse gases come from food waste.', text: 'text-sky', bar: 'bg-sky' },
]

function ProblemPanel() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
      <Reveal className="relative min-h-[340px] overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-saffron-soft via-white to-tomato-soft lg:min-h-[540px]">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="mx-auto grid h-40 w-40 place-items-center rounded-full bg-white text-7xl shadow-[0_20px_50px_rgba(20,20,20,.10)]">🍛</div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-ink/50">Good food, unused</p>
            </div>
          </div>
        )}

        <img
          src="/mainimage.png"
          alt="Surplus food at the end of the day"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur sm:inset-x-6 sm:bottom-6 sm:max-w-sm">
          <p className="font-display text-lg leading-snug text-ink">Extra food at closing time. A hungry neighbour a few streets away.</p>
        </div>
      </Reveal>

      <div className="flex flex-col justify-center">
        {problemStats.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12} className="flex items-start gap-5 border-t border-line py-7 first:border-t-0 first:pt-0 last:pb-0 sm:gap-7">
            <span className={`mt-1 h-16 w-1.5 shrink-0 rounded-full ${s.bar}`} />
            <div>
              <b className={`block font-display text-5xl font-normal leading-none sm:text-6xl ${s.text}`}>{s.n}</b>
              <p className="mt-3 max-w-sm text-base leading-7 text-ink/75 sm:text-lg">{s.t}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

const roles = [
  { n: '1', who: 'A donor', does: 'shares what food is available.', chip: 'bg-saffron-soft text-saffron-deep', ring: 'border-saffron', ic: '🍱' },
  { n: '2', who: 'A nearby organisation', does: 'can request it.', chip: 'bg-sky-soft text-sky', ring: 'border-sky', ic: '🏠' },
  { n: '3', who: 'A volunteer', does: 'helps arrange collection.', chip: 'bg-leaf-soft text-leaf', ring: 'border-leaf', ic: '🛵' },
]

const features = [
  { src: '/donation.jpg', alt: 'Packed meals ready to be donated', h: 'Easy food donation', p: 'Restaurants, hotels, caterers and homes can post surplus fast.', bg: 'bg-saffron-soft', dot: 'bg-saffron', top: 'border-t-saffron' },
  { src: '/people.jpg', alt: 'A partner organisation receiving food', h: 'Verified NGO partners', p: 'Every charity is checked, so food reaches people safely.', bg: 'bg-sky-soft', dot: 'bg-sky', top: 'border-t-sky' },
  { src: '/delivery.jpg', alt: 'A volunteer on a scooter carrying a food box', h: 'Pickup coordination', p: 'Smart matching and live status remove the logistics guesswork.', bg: 'bg-tomato-soft', dot: 'bg-tomato', top: 'border-t-tomato' },
  { src: '/community.jpg', alt: 'Neighbours sharing a meal together', h: 'Community participation', p: 'Volunteer, join a neighbourhood drive, or sponsor a meal.', bg: 'bg-leaf-soft', dot: 'bg-leaf', top: 'border-t-leaf' },
]

function FeatureCard({ f, i }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <Reveal delay={i * 0.1} className={`${card} ${f.top} overflow-hidden border-t-[6px] transition hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(20,20,20,.10)]`}>
      <div className={`relative aspect-[4/3] w-full ${f.bg}`}>
        {!loaded && <div className="absolute inset-0"><FeatureVisual kind={i} /></div>}

        <img
          src={f.src}
          alt={f.alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      <div className="p-6">
        <span className={`mb-3 block h-1.5 w-8 rounded-full ${f.dot}`} />
        <h3 className="text-xl">{f.h}</h3>
        <p className="mt-2 leading-7">{f.p}</p>
      </div>
    </Reveal>
  )
}

const impact = [
  [48200, '', 'Meals rescued', 'text-saffron-deep', 'border-b-saffron'],
  [21500, 'kg', 'Food kept out of landfill', 'text-tomato', 'border-b-tomato'],
  [320, '', 'Donors and NGOs', 'text-sky', 'border-b-sky'],
  [54, ' t', 'CO₂ Emissions avoided', 'text-leaf', 'border-b-leaf'],
]

export default function App() {
  const [sent, setSent] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // New states for Partner and Volunteer forms
  const [activeContactForm, setActiveContactForm] = useState('')
  const [contactSubmitted, setContactSubmitted] = useState(false)

  const openContactForm = (role) => {
    setActiveContactForm(role)
    setContactSubmitted(false)
  }

  const closeContactForm = () => {
    setActiveContactForm('')
    setContactSubmitted(false)
  }

  return (
    <>
      <Preloader />

      {/* Responsive Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6 sm:py-4">

        <a href="#top" className="shrink-0 font-display text-xl tracking-tight text-ink no-underline sm:text-2xl">
          Food<span className="text-leaf">Bridge</span>
        </a>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {[['problem', 'The problem'], ['how', 'How it works'], ['impact', 'Impact']].map(([id, l]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap font-medium text-ink/80 no-underline transition hover:text-ink">
              {l}
            </a>
          ))}

          <a href="#join" className="whitespace-nowrap rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md shadow-leaf/20 transition hover:-translate-y-0.5 hover:bg-leaf-deep">
            Donate food
          </a>
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="hamburger md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <span className="hamburger-close">✕</span>
          ) : (
            <>
              <span></span>
              <span></span>
              <span></span>
            </>
          )}
        </button>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="absolute left-0 right-0 top-full border-t border-line bg-white p-5 shadow-lg md:hidden">
            <div className="flex flex-col gap-4">
              {[
                ['problem', 'The problem'],
                ['how', 'How it works'],
                ['impact', 'Impact'],
                ['join', 'Donate food'],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-ink no-underline transition hover:text-leaf"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      <header id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#FBFAF7]">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6 sm:pt-28">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-5 inline-flex max-w-full items-center gap-3 rounded-full border border-line bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink shadow-sm sm:text-xs sm:tracking-[0.2em]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-leaf" /> Food rescue network · Coimbatore
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-[860px] text-[clamp(2.4rem,5.4vw,4.9rem)] leading-[1.05] tracking-[-0.02em]"
          >
            A better route for <span className="text-leaf">good food.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="mt-5 max-w-[600px] text-base leading-7 text-ink/75 sm:text-lg sm:leading-8">
            FoodBridge connects surplus food with nearby communities through a coordinated network of donors, local organisations and volunteers.
          </motion.p>

          <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap sm:gap-4">
            <a href="#join" className="rounded-full bg-leaf px-7 py-3.5 text-center font-semibold text-white no-underline shadow-lg shadow-leaf/20 transition hover:-translate-y-0.5 hover:bg-leaf-deep sm:px-8">Donate surplus food</a>
            <a href="#how" className="rounded-full border-2 border-ink bg-white px-7 py-3 text-center font-semibold text-ink no-underline transition hover:bg-ink hover:text-white sm:px-8">See how it works</a>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="text-ink/75"><b className="font-display text-3xl font-normal text-saffron-deep"><Counter to={48200} align="left" /></b> meals rescued and counting</p>
            <span className="hidden h-8 w-px bg-ink/15 sm:block" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">From surplus to someone’s next meal</p>
          </div>
        </div>

        <div className="relative mt-4 min-h-[300px] w-full flex-1 sm:min-h-[340px] lg:min-h-[400px]">
          <Scene />
        </div>
      </header>

      <Section id="problem" tone="white" title="Good food is often left over. Nearby, people still need a meal." lead="Restaurants can have safe food left at the end of the day, while local communities need support. FoodBridge is designed to help them find each other.">
        <ProblemPanel />
      </Section>

      <section id="solution" className="relative bg-mist px-4 py-16 sm:px-6 sm:py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">The idea</p>
            <h2 className="text-3xl leading-[1.12] md:text-5xl">A simple way to get extra food where it’s needed.</h2>
            <p className="mt-5 max-w-lg text-base leading-8 md:text-lg">A donor shares what food is available. A nearby organisation can request it, and a volunteer helps arrange collection.</p>
          </Reveal>

          <div className="relative grid gap-4">
            <span aria-hidden="true" className="absolute bottom-10 left-[39px] top-10 hidden w-px border-l-2 border-dashed border-ink/20 sm:block" />
            {roles.map((r, i) => (
              <Reveal key={r.n} delay={i * 0.12}>
                <div className={`${card} relative flex items-center gap-5 border-l-[6px] p-5 sm:p-6 ${r.ring}`}>
                  <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl ${r.chip}`}>{r.ic}</span>
                  <p className="text-lg leading-7 text-ink"><b className="font-display text-xl font-normal">{r.who}</b><br /><span className="text-muted">{r.does}</span></p>
                  <span className="ml-auto font-display text-4xl text-ink/15">{r.n}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Section id="how" tone="white" title="How a food donation gets delivered" lead="Follow the steps from the first listing to the meal being served.">
        <Suspense fallback={null}><How3D /></Suspense>
      </Section>

      <Section id="features" tone="mist" title="A few ways FoodBridge can help">
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => <FeatureCard key={f.h} f={f} i={i} />)}
        </div>
      </Section>

      <Section id="community" tone="white" title="FoodBridge Help Session" lead="Step into the community mission room: join a local rescue drive, sponsor meals, and follow food moving towards the people who need it.">
        <Community />
      </Section>

      <Section id="impact" tone="mist" title="The difference food sharing can make" lead="Example impact figures for the FoodBridge concept.">
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impact.map(([n, s, l, text, border]) => (
            <Reveal key={l} className={`${card} border-b-[6px] ${border} p-8 text-center`}>
              <b className={`font-display text-5xl font-normal ${text}`}><Counter to={n} suffix={s} /></b>
              <p className="mt-2 text-ink/75">{l}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="stories" tone="white" title="Community stories" lead="Meet the people a single donation can reach: the donor, the volunteer and the shelter.">
        <StoriesPhone />
      </Section>

      <Section id="join" tone="mist" title="Would you like to take part?" lead="Choose how you’d like to help, or send us a food donation alert.">
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4">
            {[
              ['Volunteer', 'Give an evening and carry meals to those who need them.'],
              ['Partner with us', 'NGOs and companies who want to scale rescue together.'],
            ].map(([h, p]) => (
              <Reveal key={h} className={`${card} p-7`}>
                <h3 className="text-2xl">{h}</h3>
                <p className="mb-4 mt-1">{p}</p>
                <button
                  type="button"
                  onClick={() => openContactForm(h)}
                  className="inline-block rounded-full border-2 border-ink px-6 py-2 font-semibold text-ink transition hover:bg-ink hover:text-white"
                >
                  Get in touch
                </button>
              </Reveal>
            ))}
          </div>

          <Reveal className={`${card} p-7`}>
            {sent ? (
              <Suspense fallback={<div className="py-24 text-center text-muted">Sending…</div>}>
                <DonationThanks info={sent} onReset={() => setSent(null)} />
              </Suspense>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const f = new FormData(e.currentTarget)
                  setSent({
                    name: String(f.get('name') || ''),
                    food: String(f.get('food') || ''),
                    area: String(f.get('area') || ''),
                  })
                }}
                className="grid gap-4"
              >
                <h3 className="text-2xl">Quick donation</h3>
                {[['name', 'Your name', 'Priya Kumar'], ['food', 'What’s available?', '40 plates of veg biryani'], ['area', 'Pickup area', 'RS Puram, Coimbatore']].map(([key, l, ph]) => (
                  <label key={key} className="text-sm font-semibold text-ink">{l}
                    <input required name={key} placeholder={ph} className="mt-1 w-full rounded-xl px-4 py-3 text-base font-normal" />
                  </label>
                ))}
                <button className="rounded-full bg-leaf px-8 py-3.5 font-semibold text-white shadow-lg shadow-leaf/20 transition hover:-translate-y-0.5 hover:bg-leaf-deep">Send donation alert</button>
              </form>
            )}
          </Reveal>
        </div>
      </Section>

      {/* Partner / Volunteer registration popup */}
      {activeContactForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-form-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeContactForm()
          }}
        >
          <div className="relative w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeContactForm}
              aria-label="Close form"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-mist text-xl text-ink transition hover:bg-leaf hover:text-white"
            >
              ×
            </button>

            {contactSubmitted ? (
              <div className="py-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf-soft text-3xl text-leaf">✓</div>
                <h3 className="mt-5 text-2xl font-semibold text-ink">Thank you for reaching out!</h3>
                <p className="mt-3 leading-7 text-ink/70">
                  Your {activeContactForm.toLowerCase()} interest has been noted.
                  Our organisation will reach out to you soon.
                </p>
                <button
                  type="button"
                  onClick={closeContactForm}
                  className="mt-6 rounded-full bg-leaf px-7 py-3 font-semibold text-white transition hover:bg-leaf-deep"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
                  Join FoodBridge
                </p>
                <h3 id="contact-form-title" className="pr-8 text-2xl font-semibold text-ink">
                  {activeContactForm}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  Share your details and our team will get in touch with you.
                </p>

                <form
                  className="mt-6 grid gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setContactSubmitted(true)
                  }}
                >
                  <label className="grid gap-1.5 text-sm font-semibold text-ink">
                    Name
                    <input
                      required
                      name="contactName"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20"
                    />
                  </label>

                  <label className="grid gap-1.5 text-sm font-semibold text-ink">
                    Gmail address
                    <input
                      required
                      name="contactEmail"
                      type="email"
                      autoComplete="email"
                      placeholder="you@gmail.com"
                      pattern="[a-zA-Z0-9._%+-]+@gmail\\.com"
                      title="Please enter a Gmail address ending in @gmail.com"
                      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20"
                    />
                  </label>

                  <button
                    type="submit"
                    className="mt-2 rounded-full bg-leaf px-7 py-3 font-semibold text-white shadow-md shadow-leaf/20 transition hover:-translate-y-0.5 hover:bg-leaf-deep"
                  >
                    Submit
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <footer className="bg-ink px-4 py-12 text-white sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <a href="#top" className="font-display text-2xl tracking-tight text-white no-underline">Food<span className="text-[#5FD39A]">Bridge</span></a>
            <p className="mt-3 max-w-sm text-white/70">Helping good food reach people who can use it.</p>
          </div>

          <div>
            <h4 className="mb-2 text-lg text-white">Explore</h4>
            <ul className="space-y-1 text-white/70">
              <li><a className="no-underline hover:text-white" href="#problem">The problem</a></li>
              <li><a className="no-underline hover:text-white" href="#how">How it works</a></li>
              <li><a className="no-underline hover:text-white" href="#impact">Impact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-lg text-white">Contact</h4>
            <ul className="space-y-1 text-white/70">
              <li>hello@foodbridge.in</li>
              <li>+91 98765 43210</li>
              <li>Coimbatore, Tamil Nadu</li>
            </ul>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-6xl border-t border-white/15 pt-6 text-sm text-white/55">© 2026 FoodBridge.</p>
      </footer>
    </>
  )
}
