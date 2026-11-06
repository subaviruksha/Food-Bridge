import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox, Sparkles } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

const { damp } = THREE.MathUtils
const COLORS = ['#D9482B', '#F29A1F', '#1E7A4C', '#2A7DC0', '#E0658A', '#F6C25B', '#8A5BB5']

/* A solid 3D heart */
function makeHeart() {
  const s = new THREE.Shape()
  s.moveTo(0.25, 0.25)
  s.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0)
  s.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35)
  s.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95)
  s.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35)
  s.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0)
  s.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 18 })
  g.center()
  return g
}

/* Hearts that float up out of the box, one after another */
function Hearts() {
  const geo = useMemo(makeHeart, [])
  const refs = useRef([])
  const items = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    color: COLORS[i % COLORS.length],
    speed: 0.16 + (i % 3) * 0.04,
    offset: i / 10,
    sway: 0.45 + (i % 4) * 0.14,
    phase: i * 1.7,
    size: 0.2 + (i % 3) * 0.05,
  })), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    items.forEach((it, i) => {
      const m = refs.current[i]
      if (!m) return
      const k = (t * it.speed + it.offset) % 1
      m.position.set(Math.sin(it.phase + k * 5) * it.sway, 0.9 + k * 2.4, Math.cos(it.phase + k * 4) * 0.35)
      m.scale.setScalar(Math.max(0.001, Math.sin(k * Math.PI) * it.size * 2.2))
      m.rotation.set(0, t * 1.4 + i, Math.sin(t + i) * 0.25)
    })
  })

  return items.map((it, i) => (
    <group key={i} ref={(el) => (refs.current[i] = el)}>
      <mesh geometry={geo} rotation-z={Math.PI} castShadow>
        <meshStandardMaterial color={it.color} roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  ))
}

/* The donation box drops in, bounces, and opens its lid */
function Gift() {
  const grp = useRef(), lid = useRef(), glow = useRef()
  const t0 = useRef(0)
  useFrame(({ clock }, dt) => {
    dt = Math.min(dt, 0.05)
    t0.current += dt
    const t = clock.elapsedTime
    const g = grp.current
    g.position.y = damp(g.position.y, Math.sin(t * 1.6) * 0.04, 5, dt)
    g.scale.setScalar(damp(g.scale.x, 1.55, 6, dt))
    g.rotation.y = Math.sin(t * 0.7) * 0.3 - 0.35
    lid.current.rotation.x = damp(lid.current.rotation.x, t0.current > 0.9 ? -2.0 : 0, 3.2, dt)
    glow.current.intensity = damp(glow.current.intensity, t0.current > 0.9 ? 5 : 0, 3, dt)
  })
  return (
    <group ref={grp} position={[0, 3.5, 0]} scale={0.01}>
      <RoundedBox args={[0.6, 0.4, 0.5]} radius={0.05} castShadow>
        <meshStandardMaterial color="#E8892B" roughness={0.5} />
      </RoundedBox>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[0, 0, s * 0.256]}><boxGeometry args={[0.34, 0.17, 0.012]} /><meshStandardMaterial color="#FFFFFF" /></mesh>
          <mesh position={[0, 0, s * 0.264]}><boxGeometry args={[0.26, 0.09, 0.012]} /><meshBasicMaterial color="#1E7A4C" toneMapped={false} /></mesh>
        </group>
      ))}
      <group ref={lid} position={[0, 0.2, -0.25]}>
        <RoundedBox args={[0.64, 0.06, 0.54]} radius={0.02} position={[0, 0.03, 0.25]}><meshStandardMaterial color="#F6C25B" /></RoundedBox>
        <mesh position={[0, 0.065, 0.25]}><boxGeometry args={[0.1, 0.02, 0.55]} /><meshStandardMaterial color="#8A4B21" /></mesh>
      </group>
      <pointLight ref={glow} color="#FFC46B" intensity={0} distance={4} position={[0, 0.5, 0]} />
    </group>
  )
}

const STEPS = [
  { t: 'Nearby partners alerted', c: 'bg-sky', soft: 'bg-sky-soft text-sky' },
  { t: 'Volunteer finds a route', c: 'bg-tomato', soft: 'bg-tomato-soft text-tomato' },
  { t: 'Meal reaches a table', c: 'bg-leaf', soft: 'bg-leaf-soft text-leaf' },
]

/* Shown after “Send donation alert”: a 3D box opening with hearts, and a personal thank-you */
export default function DonationThanks({ info, onReset }) {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    if (stage >= STEPS.length) return
    const id = setTimeout(() => setStage((s) => s + 1), 1500)
    return () => clearTimeout(id)
  }, [stage])

  const first = (info.name || '').trim().split(/\s+/)[0] || 'friend'

  return (
    <div role="status" aria-live="polite" className="text-center">
      <div className="relative mx-auto h-[250px] w-full max-w-sm sm:h-[280px]">
        <Canvas dpr={[1, 1.5]} shadows camera={{ position: [0, 1.5, 6.2], fov: 36 }} gl={{ alpha: true, antialias: true }} onCreated={({ camera }) => camera.lookAt(0, 1.2, 0)}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[3, 5, 4]} intensity={2.4} castShadow />
          <pointLight position={[-3, 2, 3]} intensity={6} color="#FFE9C4" />
          <Gift />
          <Hearts />
          <Sparkles count={26} scale={[3.4, 3, 2]} position={[0, 1.8, 0]} size={4} speed={0.35} color="#F29A1F" />
          <ContactShadows position={[0, -0.34, 0]} opacity={0.3} scale={5} blur={2.4} far={2} />
        </Canvas>
      </div>

      <motion.h3 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="text-3xl leading-tight md:text-4xl">
        Thank you, <span className="text-leaf">{first}</span>!
      </motion.h3>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="mx-auto mt-3 max-w-md leading-7">
        Your alert for <b className="text-ink">{info.food}</b> in <b className="text-ink">{info.area}</b> is on its way to nearby partners. Because of you, good food has a chance to reach someone tonight.
      </motion.p>

      <div className="mx-auto mt-6 grid max-w-md gap-2 text-left">
        {STEPS.map((s, i) => {
          const done = stage > i
          return (
            <motion.div key={s.t} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.15 }}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-500 ${done ? `${s.c} text-white` : 'bg-ink/10 text-ink/50'}`}>{done ? '✓' : i + 1}</span>
              <span className={`transition-colors duration-500 ${done ? 'font-semibold text-ink' : 'text-muted'}`}>{s.t}</span>
            </motion.div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-ink/50">Demo preview of how a real donation would be tracked.</p>

      <button onClick={onReset} className="mt-5 rounded-full border-2 border-ink px-6 py-2 font-semibold text-ink transition hover:bg-ink hover:text-white">Send another donation</button>
    </div>
  )
}
