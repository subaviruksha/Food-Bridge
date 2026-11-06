import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, ContactShadows, Sparkles, useGLTF } from '@react-three/drei'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import * as THREE from 'three'
import { LANE_A, LANE_B, STATIONS, createRider, setGoal, stepRider } from './scooterRoute.js'

const mobile = typeof window !== 'undefined' && window.innerWidth < 768
const { damp } = THREE.MathUtils

/* ---- things you may want to tweak ------------------------------------------------ */
// The scooter model is turned to drive nose-first automatically.
// If it drives BACKWARDS (tail first), set this to true:
const FLIP_MODEL = false
// Where the food box sits on a real scooter model, as a fraction of the scooter size:
//   x: 0 = middle, negative = towards the back.   y: height of the seat, 0 = ground, 1 = top of the scooter
const BOX_ON_MODEL = { x: -0.34, y: 0.55 }
// ----------------------------------------------------------------------------------

const C = {
  saffron: '#F29A1F',
  tomato: '#D9482B',
  sky: '#2A7DC0',
  leaf: '#1E7A4C',
  ink: '#141414',
}

const STEPS = [
  { ic: '📝', h: 'Share the extra food', p: 'Add what you have, how much is available and when it can be collected.', toast: '📝 Listing created · 40 plates of veg biryani', ms: 5000, c: C.saffron },
  { ic: '🔔', h: 'Local partners are notified', p: 'Nearby verified organisations receive the donation details.', toast: '🔔 New donation 1.2 km away · 3 NGOs alerted', ms: 5000, c: C.sky },
  { ic: '🛵', h: 'A volunteer collects it', p: 'A volunteer arranges a pickup with the donor.', toast: '🛵 Sruthi picked up your order · ETA 12 min', ms: 10500, c: C.tomato },
  { ic: '🍛', h: 'Food reaches the table', p: 'The food is delivered to the people it was intended for.', toast: '🍛 Meal served · 40 people fed', ms: 6000, c: C.leaf },
]

const STAND = new THREE.Vector3(-2.9, 0.9, 0.7) // crate waiting on the restaurant counter
const TABLE_TOP = new THREE.Vector3(5.2, 1.04, 0.2) // crate on the community table
const CRATE_ON_SCOOTER = 0.85 // crate scale while riding

const easeInOut = (t) => t * t * (3 - 2 * t)

function Restaurant() {
  return (
    <group position={[-5, 0, -0.5]}>
      <RoundedBox args={[2.6, 2.2, 2]} radius={0.08} position={[0, 1.1, 0]} castShadow>
        <meshStandardMaterial color="#F2A65A" roughness={0.6} />
      </RoundedBox>
      {/* roof band */}
      <mesh position={[0, 2.25, 0]} castShadow><boxGeometry args={[2.8, 0.14, 2.2]} /><meshStandardMaterial color="#B83A26" roughness={0.6} /></mesh>
      {/* striped awning */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-1.225 + i * 0.35, 1.9, 1.2]} rotation={[0.45, 0, 0]} castShadow>
          <boxGeometry args={[0.35, 0.06, 1]} />
          <meshStandardMaterial color={i % 2 ? '#FFFFFF' : '#D9482B'} />
        </mesh>
      ))}
      {/* sign */}
      <mesh position={[0, 2.62, 0.2]}><boxGeometry args={[1.8, 0.4, 0.12]} /><meshStandardMaterial color="#1E7A4C" /></mesh>
      <mesh position={[0, 2.62, 0.27]}><boxGeometry args={[1.4, 0.07, 0.02]} /><meshBasicMaterial color="#FFFFFF" toneMapped={false} /></mesh>
      {/* window + door */}
      <mesh position={[-0.75, 1.0, 1.01]}><planeGeometry args={[0.8, 0.8]} /><meshBasicMaterial color="#FFE8A8" toneMapped={false} /></mesh>
      <mesh position={[-0.75, 1.0, 1.015]}><boxGeometry args={[0.04, 0.8, 0.01]} /><meshStandardMaterial color="#8A4B21" /></mesh>
      <mesh position={[-0.75, 1.0, 1.015]}><boxGeometry args={[0.8, 0.04, 0.01]} /><meshStandardMaterial color="#8A4B21" /></mesh>
      <mesh position={[0.75, 0.7, 1.01]}><planeGeometry args={[0.7, 1.4]} /><meshStandardMaterial color="#6B3A1E" /></mesh>
      {/* counter the crate waits on */}
      <RoundedBox args={[1.2, 0.7, 0.6]} radius={0.05} position={[2.1, 0.35, 1.2]} castShadow>
        <meshStandardMaterial color="#9B6A3F" roughness={0.6} />
      </RoundedBox>
      <mesh position={[2.1, 0.71, 1.2]}><boxGeometry args={[1.28, 0.05, 0.68]} /><meshStandardMaterial color="#E6C48F" /></mesh>
    </group>
  )
}

function Ngo({ position, s = 1, bell, wall = '#8CC4EE', roof = '#2A5F96' }) {
  return (
    <group position={position} scale={s}>
      <RoundedBox args={[1.8, 1.5, 1.4]} radius={0.06} position={[0, 0.75, 0]} castShadow><meshStandardMaterial color={wall} roughness={0.55} /></RoundedBox>
      <mesh position={[0, 1.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><cylinderGeometry args={[0, 1.4, 0.7, 4]} /><meshStandardMaterial color={roof} /></mesh>
      <mesh position={[0, 0.95, 0.705]}><boxGeometry args={[0.62, 0.62, 0.03]} /><meshStandardMaterial color="#FFFFFF" /></mesh>
      <mesh position={[0, 0.95, 0.73]}><boxGeometry args={[0.46, 0.14, 0.03]} /><meshBasicMaterial color={C.leaf} toneMapped={false} /></mesh>
      <mesh position={[0, 0.95, 0.73]}><boxGeometry args={[0.14, 0.46, 0.03]} /><meshBasicMaterial color={C.leaf} toneMapped={false} /></mesh>
      <mesh position={[0, 0.3, 0.71]}><boxGeometry args={[0.42, 0.6, 0.03]} /><meshStandardMaterial color="#F6F1E4" /></mesh>
      <mesh ref={bell} position={[0, 2.7, 0]} scale={0.001}>
        <sphereGeometry args={[0.3, 24, 24]} /><meshBasicMaterial color="#F2B01E" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Person({ position, color, reg }) {
  return (
    <group position={position} ref={reg}>
      <mesh position={[0, 0.55, 0]} castShadow><capsuleGeometry args={[0.22, 0.5, 8, 16]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
      <mesh position={[0, 1.2, 0]} castShadow><sphereGeometry args={[0.2, 24, 24]} /><meshStandardMaterial color="#B98768" roughness={0.7} /></mesh>
    </group>
  )
}

/* Code-built scooter (shows while the real model loads, or if it fails). Nose points to +x. */
function Scooter({ wheels }) {
  const body = <meshPhysicalMaterial color="#2A6FB5" roughness={0.3} clearcoat={1} />
  return (
    <group>
      <RoundedBox args={[1.1, 0.22, 0.36]} radius={0.08} position={[0, 0.42, 0]} castShadow>{body}</RoundedBox>
      <RoundedBox args={[0.34, 0.5, 0.34]} radius={0.08} position={[0.5, 0.62, 0]} rotation={[0, 0, -0.25]} castShadow>{body}</RoundedBox>
      <RoundedBox args={[0.5, 0.12, 0.32]} radius={0.05} position={[-0.2, 0.62, 0]}><meshStandardMaterial color="#1a1a1a" /></RoundedBox>
      <RoundedBox args={[0.5, 0.05, 0.4]} radius={0.02} position={[-0.65, 0.62, 0]}><meshStandardMaterial color="#222" /></RoundedBox>
      <mesh position={[0.58, 0.8, 0]} rotation={[0, 0, -0.2]}><cylinderGeometry args={[0.025, 0.025, 0.45, 12]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0.52, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.5, 12]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0.72, 0.72, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#FFF3C4" toneMapped={false} /></mesh>
      {[-0.5, 0.5].map((x, i) => (
        <group key={i} position={[x, 0.22, 0]} ref={(el) => (wheels.current[i] = el)}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.22, 0.22, 0.12, 24]} /><meshStandardMaterial color="#111" roughness={0.8} /></mesh>
          <mesh position={[0.14, 0, 0.07]}><boxGeometry args={[0.1, 0.04, 0.02]} /><meshBasicMaterial color="#ddd" /></mesh>
        </group>
      ))}
      {/* rider: green volunteer tee, white helmet */}
      <mesh position={[-0.12, 1.05, 0]} castShadow><capsuleGeometry args={[0.18, 0.35, 8, 16]} /><meshStandardMaterial color={C.leaf} /></mesh>
      <mesh position={[-0.05, 1.55, 0]} castShadow><sphereGeometry args={[0.2, 24, 24]} /><meshStandardMaterial color="#FFFFFF" roughness={0.3} /></mesh>
    </group>
  )
}

/* Real 3D scooter (public/models/scooter.glb). Auto-scales, sits on the ground and is turned to drive nose-first. */
function ScooterModel({ seat, url = '/models/scooter.glb', length = 1.7 }) {
  const { scene } = useGLTF(url)
  const { model, yaw, seatPos } = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      o.receiveShadow = true
      const list = (Array.isArray(o.material) ? o.material : [o.material]).map((m) => {
        const n = m.clone()
        if (n.metalness > 0.5) n.metalness = 0.4 // fully metallic looks black without a sky map
        if (n.roughness < 0.3) n.roughness = 0.4
        n.envMapIntensity = 1.5
        if (n.map) { n.emissiveMap = n.map; n.emissive = new THREE.Color('#ffffff'); n.emissiveIntensity = 0.35 } // brightens dark textures
        n.side = THREE.DoubleSide
        return n
      })
      o.material = Array.isArray(o.material) ? list : list[0]
    })
    const box = new THREE.Box3().setFromObject(c)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const k = length / Math.max(size.x, size.z)
    c.scale.setScalar(k)
    c.position.set(-center.x * k, -box.min.y * k, -center.z * k)
    // most models are built nose-forward along z; the road runs along x, so turn them a quarter
    const yaw = (size.z > size.x ? Math.PI / 2 : 0) + (FLIP_MODEL ? Math.PI : 0)
    const h = size.y * k
    return { model: c, yaw, seatPos: { x: BOX_ON_MODEL.x * length, top: BOX_ON_MODEL.y * h } }
  }, [scene, length])
  useEffect(() => { if (seat) seat.current = seatPos }, [seat, seatPos])
  return (
    <group>
      <group rotation-y={yaw}><primitive object={model} /></group>
      <pointLight position={[length * 0.55, 0.9, 0]} color="#FFF3C4" intensity={2} distance={4} />
      <pointLight position={[0, 2.2, 1.2]} intensity={1.5} distance={6} />
    </group>
  )
}
useGLTF.preload('/models/scooter.glb')

/* If the .glb is missing or fails, fall back to the code-built scooter instead of crashing */
class Boundary extends Component {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  componentDidCatch(e) { console.error('Scooter failed to load:', e) }
  render() { return this.state.err ? this.props.fallback : this.props.children }
}

/* The donation box: orange crate, cream lid, strap and a green FoodBridge label */
function Crate({ lid }) {
  return (
    <>
      <RoundedBox args={[0.6, 0.4, 0.5]} radius={0.05} castShadow><meshStandardMaterial color="#E8892B" roughness={0.5} /></RoundedBox>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[0, 0, s * 0.256]}><boxGeometry args={[0.34, 0.17, 0.012]} /><meshStandardMaterial color="#FFFFFF" /></mesh>
          <mesh position={[0, 0, s * 0.264]}><boxGeometry args={[0.26, 0.09, 0.012]} /><meshBasicMaterial color={C.leaf} toneMapped={false} /></mesh>
        </group>
      ))}
      <group ref={lid} position={[0, 0.2, -0.25]}>
        <RoundedBox args={[0.64, 0.06, 0.54]} radius={0.02} position={[0, 0.03, 0.25]}><meshStandardMaterial color="#F6C25B" /></RoundedBox>
        <mesh position={[0, 0.065, 0.25]}><boxGeometry args={[0.1, 0.02, 0.55]} /><meshStandardMaterial color="#8A4B21" /></mesh>
      </group>
    </>
  )
}

function World({ step }) {
  const st = useRef({ last: -1 })
  const rig = useRef(), crate = useRef(), lid = useRef(), boxLight = useRef(), phone = useRef(), plates = useRef()
  const rings = useRef([]), bells = useRef([]), people = useRef([]), wheels = useRef([])
  const look = useRef(-3.2)
  const rider = useRef(createRider())
  const seat = useRef({ x: -0.62, top: 0.65 }) // where the box sits on the scooter (the real model updates this)
  const load = useRef({ state: 'stand', t: 0 })
  const tmp = useMemo(() => ({ rack: new THREE.Vector3(), pos: new THREE.Vector3() }), [])

  useEffect(() => { if (rig.current) rig.current.rotation.order = 'YXZ'; if (crate.current) crate.current.rotation.order = 'YXZ' }, [])

  useFrame(({ camera, pointer, clock }, dt) => {
    dt = Math.min(dt, 0.05)
    const s = st.current
    s.last = step
    const time = clock.elapsedTime
    const R = rider.current
    const L = load.current

    // ---- scooter ----
    setGoal(R, step >= 2 ? 'TABLE' : 'HOME')
    const events = stepRider(R, dt)

    // ---- camera (follows the scooter while it rides) ----
    const cx = step === 0 ? -3.2 : step === 1 ? 0 : step === 2 ? THREE.MathUtils.clamp(R.x * 0.75, -2.6, 2.6) : 3.2
    camera.position.x = damp(camera.position.x, cx + pointer.x * 0.8, 2.5, dt)
    camera.position.y = damp(camera.position.y, 3.8 - pointer.y * 0.3, 2.5, dt)
    look.current = damp(look.current, cx, 2.5, dt)
    camera.lookAt(look.current, 1, 0.8)

    const rg = rig.current
    rg.position.set(R.x, 0, R.z)
    rg.rotation.set(R.lean, R.h, 0)
    wheels.current.forEach((w) => w && (w.rotation.z -= (R.v * dt) / 0.22))

    // ---- crate state machine ----
    for (const e of events) {
      if (e === 'arrive:PICK' && R.goal !== 'PICK' && L.state === 'stand') { L.state = 'loading'; L.t = 0 }
      if (e === 'arrive:TABLE' && L.state === 'loaded') { L.state = 'unloading'; L.t = 0 }
    }
    if (step < 2 && L.state !== 'stand') { L.state = 'stand'; crate.current.scale.setScalar(0.001) } // new round: a fresh box on the counter

    const cosH = Math.cos(R.h), sinH = Math.sin(R.h)
    tmp.rack.set(R.x + seat.current.x * cosH, seat.current.top + 0.2 * CRATE_ON_SCOOTER + 0.01, R.z - seat.current.x * sinH)
    const cr = crate.current
    if (L.state === 'stand') {
      cr.position.copy(STAND); cr.rotation.y = 0
      cr.scale.setScalar(damp(cr.scale.x, 1, 4, dt))
    } else if (L.state === 'loading') {
      L.t += dt / 0.9
      const p = easeInOut(Math.min(1, L.t))
      cr.position.lerpVectors(STAND, tmp.rack, p); cr.position.y += Math.sin(p * Math.PI) * 0.6
      cr.rotation.y = R.h * p
      cr.scale.setScalar(1 - (1 - CRATE_ON_SCOOTER) * p)
      if (L.t >= 1) L.state = 'loaded'
    } else if (L.state === 'loaded') {
      cr.position.copy(tmp.rack); cr.rotation.y = R.h
      cr.rotation.x = R.lean
      cr.scale.setScalar(CRATE_ON_SCOOTER)
    } else if (L.state === 'unloading') {
      L.t += dt / 0.9
      const p = easeInOut(Math.min(1, L.t))
      cr.position.lerpVectors(tmp.rack, TABLE_TOP, p); cr.position.y += Math.sin(p * Math.PI) * 0.6
      cr.rotation.set(R.lean * (1 - p), R.h * (1 - p), 0)
      cr.scale.setScalar(CRATE_ON_SCOOTER + (1 - CRATE_ON_SCOOTER) * p)
      if (L.t >= 1) L.state = 'table'
    } else {
      cr.position.copy(TABLE_TOP); cr.rotation.set(0, 0, 0); cr.scale.setScalar(1)
    }
    if (L.state !== 'loaded' && L.state !== 'unloading') cr.rotation.x = 0
    const open = L.state === 'table' || (L.state === 'unloading' && L.t > 0.7)
    lid.current.rotation.x = damp(lid.current.rotation.x, open ? -1.3 : 0, 4, dt)
    boxLight.current.intensity = damp(boxLight.current.intensity, L.state === 'table' ? 3 : 0, 4, dt)

    // ---- phone with the listing ----
    phone.current.scale.setScalar(damp(phone.current.scale.x, step === 0 ? 1 : 0.001, 5, dt))
    phone.current.position.y = 2.5 + Math.sin(time * 2) * 0.08

    // ---- alert rings + NGO bells ----
    rings.current.forEach((m, i) => {
      if (!m) return
      const kk = (time * 0.5 + i / 3) % 1
      m.scale.setScalar(0.5 + kk * 7)
      m.material.opacity = step === 1 ? (1 - kk) * 0.8 : 0
    })
    bells.current.forEach((m, i) => m && m.scale.setScalar(damp(m.scale.x, step === 1 ? 1 + Math.sin(time * 6 + i * 1.5) * 0.15 : 0.001, 6, dt)))

    // ---- people celebrate ----
    people.current.forEach((p, i) => p && (p.position.y = damp(p.position.y, step === 3 ? Math.abs(Math.sin(time * 4 + i)) * 0.22 : 0, 8, dt)))
    plates.current.scale.setScalar(damp(plates.current.scale.x, step === 3 ? 1 : 0.001, 5, dt))
  })

  const colors = ['#D9482B', '#2A7DC0', '#F29A1F', '#1E7A4C', '#8A5BB5', '#E0658A']
  const spots = [[4.0, 0, 0.55], [4.2, 0, -0.75], [5.2, 0, -1.2], [6.3, 0, -0.75], [6.5, 0, 0.5], [5.9, 0, 1.0]]
  const MID = (LANE_A + LANE_B) / 2

  return (
    <>
      <color attach="background" args={['#EFEBE3']} />
      <fog attach="fog" args={['#EFEBE3', 18, 38]} />
      <Environment resolution={256}>
        <Lightformer intensity={2} color="#FFF1D6" position={[0, 5, -6]} scale={[10, 3, 1]} />
        <Lightformer intensity={1.4} color="#FFFFFF" position={[-6, 3, 5]} scale={[5, 4, 1]} />
      </Environment>
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#FFFFFF', '#CFC8B8', 0.6]} />
      <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow={!mobile} shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={8} shadow-camera-bottom={-8} />

      {/* ground, pavement, two-lane road */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[44, 26]} /><meshStandardMaterial color="#DDD6C6" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.008, 0.65]}><planeGeometry args={[34, 0.9]} /><meshStandardMaterial color="#C9C1AE" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, MID]} receiveShadow><planeGeometry args={[34, LANE_B - LANE_A + 1.5]} /><meshStandardMaterial color="#3A3F46" roughness={0.8} /></mesh>
      {Array.from({ length: 20 }, (_, i) => <mesh key={i} position={[-9.5 + i * 1.0, 0.02, MID]}><boxGeometry args={[0.5, 0.01, 0.07]} /><meshBasicMaterial color="#FFFFFF" /></mesh>)}

      <Restaurant />
      <Ngo position={[-1.6, 0, -2.8]} s={0.9} bell={(el) => (bells.current[0] = el)} wall="#8CC4EE" roof="#2A5F96" />
      <Ngo position={[0.6, 0, -3.4]} s={1.1} bell={(el) => (bells.current[1] = el)} wall="#F6D56B" roof="#C98A12" />
      <Ngo position={[2.6, 0, -2.8]} s={0.9} bell={(el) => (bells.current[2] = el)} wall="#F0A9BE" roof="#B5456B" />

      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (rings.current[i] = el)} rotation-x={-Math.PI / 2} position={[-3.5, 0.06, 0.5]}>
          <ringGeometry args={[0.9, 1, 64]} /><meshBasicMaterial color={C.sky} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* phone with listing */}
      <group ref={phone} position={[-2.9, 2.5, 1.2]} scale={0.001}>
        <RoundedBox args={[0.8, 1.4, 0.08]} radius={0.08}><meshStandardMaterial color="#141414" /></RoundedBox>
        <mesh position={[0, 0, 0.05]}><planeGeometry args={[0.68, 1.28]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        {[0.35, 0.05, -0.25].map((y, i) => <mesh key={i} position={[0, y, 0.06]}><planeGeometry args={[0.5, 0.16]} /><meshBasicMaterial color={i === 2 ? C.leaf : C.saffron} toneMapped={false} /></mesh>)}
      </group>

      {/* donation crate */}
      <group ref={crate} position={STAND.toArray()} scale={0.001}>
        <Crate lid={lid} />
        <pointLight ref={boxLight} color="#F6C25B" intensity={0} distance={4} position={[0, 0.5, 0]} />
      </group>

      {/* scooter: the real model if it loads, otherwise the code-built one. The box rides on the seat. */}
      <group ref={rig} position={[STATIONS.HOME.x, 0, STATIONS.HOME.z]}>
        <Boundary fallback={<Scooter wheels={wheels} />}>
          <Suspense fallback={<Scooter wheels={wheels} />}>
            <ScooterModel seat={seat} />
          </Suspense>
        </Boundary>
      </group>

      {/* community table */}
      <mesh position={[5.2, 0.4, 0.2]}><cylinderGeometry args={[0.08, 0.08, 0.8, 12]} /><meshStandardMaterial color="#6B3A1E" /></mesh>
      <mesh position={[5.2, 0.8, 0.2]} castShadow><cylinderGeometry args={[0.85, 0.85, 0.08, 32]} /><meshStandardMaterial color="#E6C48F" roughness={0.5} /></mesh>
      <group ref={plates} position={[5.2, 0.88, 0.2]} scale={0.001}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.047) * 0.58, 0, Math.sin(i * 1.047) * 0.58]}><cylinderGeometry args={[0.15, 0.15, 0.04, 20]} /><meshStandardMaterial color={i % 2 ? '#D9482B' : '#FFFFFF'} /></mesh>
        ))}
      </group>
      {spots.map((p, i) => <Person key={i} position={p} color={colors[i]} reg={(el) => (people.current[i] = el)} />)}
      {step === 3 && <Sparkles count={10} scale={[3, 2, 3]} position={[5.2, 1.8, 0.2]} size={3} speed={0.25} color="#F29A1F" />}

      {!mobile && <ContactShadows position={[0, 0.02, 0]} opacity={0.35} scale={26} blur={2.5} far={4} />}
    </>
  )
}

export default function How3D() {
  const [step, setStep] = useState(0)
  const wrap = useRef(null)
  const inView = useInView(wrap, { margin: '-15% 0px' })

  useEffect(() => {
    if (!inView) return
    const id = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEPS[step].ms)
    return () => clearTimeout(id)
  }, [step, inView])

  return (
    <div ref={wrap} className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.5fr]">
      <div className="order-2 grid gap-3 lg:order-1">
        {STEPS.map((s, i) => {
          const on = i === step
          return (
            <button key={s.h} onClick={() => setStep(i)} aria-pressed={on}
              style={on ? { borderColor: s.c } : undefined}
              className={`relative overflow-hidden rounded-2xl border-2 bg-white p-5 text-left transition ${on ? 'shadow-[0_14px_34px_rgba(20,20,20,.10)]' : 'border-line hover:border-ink/40'}`}>
              <div className="flex items-center gap-4">
                <span style={{ background: on ? s.c : '#F1EEE7', color: on ? '#fff' : '#141414' }} className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg">{i + 1}</span>
                <div>
                  <h3 className="font-display text-lg text-ink">{s.ic} {s.h}</h3>
                  {on && <p className="mt-1 text-muted">{s.p}</p>}
                </div>
              </div>
              {on && <motion.span key={step} style={{ background: s.c }} className="absolute bottom-0 left-0 h-1" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: s.ms / 1000, ease: 'linear' }} />}
            </button>
          )
        })}
      </div>

      <div className="relative order-1 h-[420px] overflow-hidden rounded-3xl border border-line bg-[#EFEBE3] shadow-[0_24px_60px_rgba(20,20,20,.10)] md:h-[600px] lg:order-2">
        <Canvas frameloop={inView ? 'always' : 'never'} shadows={!mobile} dpr={[1, mobile ? 1.5 : 1.75]} camera={{ fov: 40, position: [-3.2, 3.8, mobile ? 14 : 11] }}>
          <World step={step} />
        </Canvas>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-4 flex w-[90%] max-w-sm -translate-x-1/2 items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-ink shadow-xl">
            <span style={{ background: STEPS[step].c }} className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" />
            <div>
              <small className="block text-xs font-semibold text-muted">FoodBridge · now</small>
              <span className="font-medium">{STEPS[step].toast}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}