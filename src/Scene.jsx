import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment } from '@react-three/drei'
import { useInView } from 'framer-motion'
import * as THREE from 'three'

const BG = '#FBFAF7'

/* One delivery loop, in seconds. The parcel and both doors follow this same clock. */
const CYCLE = 18
const LEAVE = 1.0 // parcel comes out of the donor's door
const ARRIVE = 15.2 // parcel is inside the shelter's door
const DONOR_DOOR = [0.2, 3.2]
const SHELTER_DOOR = [13.4, 16.6]

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x) }
const doorAmount = (t, [a, b]) => smooth(a, a + 0.8, t) * (1 - smooth(b - 0.8, b, t))

// Detailed building. Walls, trim and roof are separate colours so every house can look different.
function Tower({ position, height = 3.7, width = 2.7, wall, trim, roof, door = '#7A4A2B', openWindow, glass = ['#FFD99B', '#BFE0F7'] }) {
  const rows = Math.max(2, Math.floor(height / 0.55))
  const doorRef = useRef()

  useFrame(({ clock }) => {
    if (!doorRef.current || !openWindow) return
    doorRef.current.rotation.y = -doorAmount(clock.elapsedTime % CYCLE, openWindow) * 1.65
  })

  return (
    <group position={position}>
      {/* Main building */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 1.65]} />
        <meshStandardMaterial color={wall} roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height + 0.1, 0]} castShadow>
        <boxGeometry args={[width + 0.25, 0.2, 1.85]} />
        <meshStandardMaterial color={trim} roughness={0.6} />
      </mesh>
      <mesh position={[0, height + 0.22, 0]}>
        <boxGeometry args={[width + 0.35, 0.06, 1.95]} />
        <meshStandardMaterial color={roof} />
      </mesh>

      {/* Windows */}
      {Array.from({ length: rows }, (_, row) =>
        [-0.62, 0, 0.62].map((x, col) => (
          <group key={`${row}-${col}`} position={[x * (width / 2.2), 0.48 + row * 0.53, 0.84]}>
            <mesh>
              <boxGeometry args={[0.43, 0.38, 0.07]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.045]}>
              <planeGeometry args={[0.32, 0.27]} />
              <meshStandardMaterial
                color={row % 2 === 0 ? glass[0] : glass[1]}
                emissive={row % 2 === 0 ? '#FFAE54' : '#5EAFE6'}
                emissiveIntensity={1.1}
                roughness={0.25}
              />
            </mesh>
            <mesh position={[0, 0, 0.055]}>
              <boxGeometry args={[0.025, 0.32, 0.025]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        ))
      )}

      {/* Doorway: warm light inside, and a hinged door that swings open when the parcel passes */}
      <mesh position={[0, 0.58, 0.83]}>
        <planeGeometry args={[0.55, 1.1]} />
        <meshBasicMaterial color="#FFE2A0" toneMapped={false} />
      </mesh>
      <group ref={doorRef} position={[-0.275, 0.58, 0.87]}>
        <mesh position={[0.275, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 1.1, 0.06]} />
          <meshStandardMaterial color={door} roughness={0.7} />
        </mesh>
        <mesh position={[0.275, 0.12, 0.035]}>
          <planeGeometry args={[0.32, 0.5]} />
          <meshStandardMaterial color="#BFE0F7" metalness={0.25} roughness={0.2} />
        </mesh>
        <mesh position={[0.46, -0.05, 0.05]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#F2B01E" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Entrance canopy */}
      <mesh position={[0, 1.22, 1.08]} castShadow>
        <boxGeometry args={[1.35, 0.12, 0.65]} />
        <meshStandardMaterial color={roof} roughness={0.65} />
      </mesh>
      {[-0.62, 0.62].map((x) => (
        <mesh key={x} position={[x, 0.58, 1.08]}>
          <boxGeometry args={[0.08, 1.15, 0.12]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Balcony ledges */}
      {[1.55, 2.65].filter((y) => y < height).map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0.94]}>
            <boxGeometry args={[width * 0.85, 0.09, 0.38]} />
            <meshStandardMaterial color={trim} />
          </mesh>
          <mesh position={[0, y + 0.2, 1.1]}>
            <boxGeometry args={[width * 0.85, 0.3, 0.045]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Foundation */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[width + 0.4, 0.2, 2]} />
        <meshStandardMaterial color="#D9D3C5" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Volunteer figure
function Person({ position, color = '#D99A62', scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {[-0.13, 0.13].map((x) => (
        <group key={x} position={[x, 0.32, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.065, 0.08, 0.48, 12]} />
            <meshStandardMaterial color="#2F3A55" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.25, 0.08]}>
            <boxGeometry args={[0.16, 0.09, 0.28]} />
            <meshStandardMaterial color="#252E32" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.83, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.4, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.13, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.14, 12]} />
        <meshStandardMaterial color="#B9825F" />
      </mesh>
      <mesh position={[0, 1.31, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color="#B9825F" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.4, -0.015]}>
        <sphereGeometry args={[0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#2E241E" roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.25, 0.85, 0.04]} rotation={[0, 0, side * -0.25]} castShadow>
          <capsuleGeometry args={[0.065, 0.28, 4, 10]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// FoodBridge delivery van (mirrored so the nose points to +x)
function Van() {
  return (
    <group scale={[-0.65, 0.65, 0.65]}>
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[1.65, 0.65, 0.82]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      <mesh position={[-0.48, 0.9, 0]} castShadow>
        <boxGeometry args={[0.68, 0.55, 0.82]} />
        <meshStandardMaterial color="#F29A1F" roughness={0.5} />
      </mesh>
      <mesh position={[-0.48, 0.92, 0.42]}>
        <planeGeometry args={[0.48, 0.34]} />
        <meshStandardMaterial color="#A9D5E8" metalness={0.25} roughness={0.2} />
      </mesh>
      {[-0.48, 0.48].map((x) =>
        [-0.42, 0.42].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.19, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.19, 0.19, 0.12, 20]} />
            <meshStandardMaterial color="#1E1E1E" roughness={0.9} />
          </mesh>
        ))
      )}
      {[-0.25, 0.25].map((z) => (
        <mesh key={z} position={[-0.84, 0.48, z]}>
          <boxGeometry args={[0.04, 0.15, 0.16]} />
          <meshStandardMaterial color="#FFF1B5" emissive="#FFCB62" emissiveIntensity={1.8} />
        </mesh>
      ))}
      {/* FoodBridge branding panel */}
      <mesh position={[0.35, 0.52, 0.416]}>
        <planeGeometry args={[0.75, 0.35]} />
        <meshStandardMaterial color="#1E7A4C" />
      </mesh>
      <mesh position={[0.35, 0.52, 0.42]}>
        <planeGeometry args={[0.5, 0.06]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
}

const wheelMat = <meshStandardMaterial color="#1E1E1E" roughness={0.9} />
const Wheel = ({ position, r = 0.17, w = 0.12 }) => (
  <group position={position} userData={{ wheel: r }}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[r, r, w, 20]} />{wheelMat}</mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[r * 0.55, r * 0.55, w + 0.01, 16]} /><meshStandardMaterial color="#CFCBC0" metalness={0.5} roughness={0.4} /></mesh>
    <mesh position={[r * 0.55, 0, w / 2 + 0.004]}><boxGeometry args={[r * 0.4, 0.03, 0.01]} /><meshBasicMaterial color="#8A8A8A" /></mesh>
  </group>
)

// Small car (nose points to +x)
function Car({ color = '#D9482B' }) {
  return (
    <group scale={0.85}>
      <mesh position={[0, 0.36, 0]} castShadow><boxGeometry args={[1.5, 0.34, 0.7]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
      <mesh position={[-0.12, 0.64, 0]} castShadow><boxGeometry args={[0.86, 0.24, 0.62]} /><meshStandardMaterial color="#BFE0F7" roughness={0.2} metalness={0.2} /></mesh>
      <mesh position={[-0.12, 0.79, 0]} castShadow><boxGeometry args={[0.8, 0.07, 0.64]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
      {[0.42, -0.42].map((x) => <mesh key={x} position={[x - 0.12, 0.64, 0]}><boxGeometry args={[0.04, 0.26, 0.64]} /><meshStandardMaterial color={color} /></mesh>)}
      {[-0.5, 0.5].map((x) => [-0.36, 0.36].map((z) => <Wheel key={`${x}${z}`} position={[x, 0.17, z]} />))}
      {[-0.22, 0.22].map((z) => <mesh key={z} position={[0.76, 0.38, z]}><boxGeometry args={[0.04, 0.1, 0.16]} /><meshStandardMaterial color="#FFF1B5" emissive="#FFCB62" emissiveIntensity={1.6} /></mesh>)}
      {[-0.22, 0.22].map((z) => <mesh key={`t${z}`} position={[-0.76, 0.38, z]}><boxGeometry args={[0.04, 0.09, 0.14]} /><meshStandardMaterial color="#E03A2A" emissive="#E03A2A" emissiveIntensity={1.2} /></mesh>)}
    </group>
  )
}

// Motorbike with a rider (nose points to +x)
function Bike({ color = '#2A7DC0', shirt = '#F29A1F' }) {
  return (
    <group scale={0.85}>
      <Wheel position={[0.5, 0.2, 0]} r={0.2} w={0.08} />
      <Wheel position={[-0.5, 0.2, 0]} r={0.2} w={0.1} />
      <mesh position={[0, 0.42, 0]} castShadow><boxGeometry args={[0.8, 0.12, 0.16]} /><meshStandardMaterial color="#2B2B2B" /></mesh>
      <mesh position={[0.14, 0.56, 0]} castShadow><boxGeometry args={[0.38, 0.18, 0.24]} /><meshStandardMaterial color={color} roughness={0.35} /></mesh>
      <mesh position={[-0.22, 0.54, 0]}><boxGeometry args={[0.42, 0.07, 0.18]} /><meshStandardMaterial color="#141414" /></mesh>
      <mesh position={[0.42, 0.42, 0]} rotation={[0, 0, 0.35]}><cylinderGeometry args={[0.025, 0.025, 0.46, 8]} /><meshStandardMaterial color="#8A8A8A" metalness={0.6} /></mesh>
      <mesh position={[0.33, 0.68, 0]}><boxGeometry args={[0.05, 0.04, 0.44]} /><meshStandardMaterial color="#2B2B2B" /></mesh>
      <mesh position={[0.46, 0.62, 0]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color="#FFF1B5" emissive="#FFCB62" emissiveIntensity={1.6} /></mesh>
      {/* rider */}
      <mesh position={[-0.2, 0.9, 0]} castShadow><capsuleGeometry args={[0.13, 0.3, 4, 10]} /><meshStandardMaterial color={shirt} /></mesh>
      <mesh position={[-0.12, 1.28, 0]} castShadow><sphereGeometry args={[0.15, 14, 14]} /><meshStandardMaterial color="#FFFFFF" roughness={0.3} /></mesh>
      <mesh position={[0.02, 0.86, 0]} rotation={[0, 0, -1.0]}><capsuleGeometry args={[0.045, 0.34, 4, 8]} /><meshStandardMaterial color={shirt} /></mesh>
      <mesh position={[-0.08, 0.58, 0]} rotation={[0, 0, 0.9]}><capsuleGeometry args={[0.06, 0.3, 4, 8]} /><meshStandardMaterial color="#2F3A55" /></mesh>
    </group>
  )
}

/* One vehicle driving along a lane forever; its wheels turn and it re-enters on the far side. */
const ROAD_LEN = 28
function Mover({ z, dir, speed, offset, children }) {
  const ref = useRef()
  const wheels = useRef([])
  useLayoutEffect(() => {
    wheels.current = []
    ref.current.traverse((o) => { if (o.userData && o.userData.wheel) wheels.current.push(o) })
  }, [])
  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g) return
    const x = ((((offset + dir * speed * clock.elapsedTime) % ROAD_LEN) + ROAD_LEN) % ROAD_LEN) - ROAD_LEN / 2
    g.position.set(x, -0.1, z)
    g.rotation.y = dir > 0 ? 0 : Math.PI
    for (const w of wheels.current) w.rotation.z -= (speed * Math.min(dt, 0.05)) / w.userData.wheel
  })
  return <group ref={ref}>{children}</group>
}

/* Everyday traffic: far lane drives right, near lane drives left (left-hand traffic, like India). */
function Traffic() {
  return (
    <>
      <Mover z={1.7} dir={1} speed={1.5} offset={0}><Van /></Mover>
      <Mover z={1.7} dir={1} speed={1.5} offset={9}><Bike color="#D9482B" shirt="#2A7DC0" /></Mover>
      <Mover z={1.7} dir={1} speed={1.5} offset={18}><Car color="#2A7DC0" /></Mover>
      <Mover z={2.5} dir={-1} speed={1.1} offset={4}><Car color="#F29A1F" /></Mover>
      <Mover z={2.5} dir={-1} speed={1.1} offset={13}><Bike color="#1E7A4C" shirt="#D9482B" /></Mover>
      <Mover z={2.5} dir={-1} speed={1.1} offset={22}><Car color="#8A5BB5" /></Mover>
    </>
  )
}

/* The parcel leaves the donor's doorway, rides an arc over the road and goes in through the shelter's doorway. */
const ROUTE_POINTS = [
  [-5.25, 0.62, 0.15], // inside the donor house (hidden by the wall)
  [-5.25, 0.62, 0.7], // in the doorway
  [-4.3, 1.5, 1.2],
  [-2.5, 2.5, 1.2],
  [0, 3.0, 1.1],
  [2.5, 2.5, 1.2],
  [4.3, 1.5, 1.2],
  [5.2, 0.62, 0.7], // shelter doorway
  [5.2, 0.62, 0.15], // inside the shelter (hidden by the wall)
]

function Parcel() {
  const ref = useRef()
  const curve = useMemo(() => new THREE.CatmullRomCurve3(ROUTE_POINTS.map((p) => new THREE.Vector3(...p)), false, 'centripetal'), [])

  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime % CYCLE
    const raw = clamp01((t - LEAVE) / (ARRIVE - LEAVE))
    const u = raw * 0.35 + smooth(0, 1, raw) * 0.65 // gentle ease at both doors
    g.visible = t > LEAVE - 0.15 && t < ARRIVE + 0.15
    curve.getPointAt(u, g.position)
    g.position.y += Math.sin(raw * Math.PI * 6) * 0.04 * Math.sin(raw * Math.PI)
    g.rotation.y = Math.sin(raw * Math.PI * 2) * 0.18
    g.rotation.z = Math.sin(raw * Math.PI * 4) * 0.04
    g.scale.setScalar(1.2 * (0.7 + 0.3 * smooth(0, 0.05, raw) * (1 - smooth(0.95, 1, raw))))
  })

  return (
    <group ref={ref} visible={false}>
      {/* Food box */}
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.42, 0.52]} />
        <meshStandardMaterial color="#E8892B" roughness={0.6} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.235, 0]} castShadow>
        <boxGeometry args={[0.66, 0.06, 0.56]} />
        <meshStandardMaterial color="#F6C25B" roughness={0.5} />
      </mesh>
      {/* Strap */}
      <mesh position={[0, 0.27, 0]}>
        <boxGeometry args={[0.12, 0.02, 0.57]} />
        <meshStandardMaterial color="#8A4B21" />
      </mesh>
      {/* FoodBridge label on both long sides */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[0, 0, s * 0.265]}><boxGeometry args={[0.36, 0.18, 0.012]} /><meshStandardMaterial color="#FFFFFF" /></mesh>
          <mesh position={[0, 0, s * 0.273]}><boxGeometry args={[0.28, 0.1, 0.012]} /><meshStandardMaterial color="#1E7A4C" /></mesh>
        </group>
      ))}
      <pointLight color="#FFB84D" intensity={2.4} distance={3} />
    </group>
  )
}

/* Dotted arc that shows where the parcel travels (same curve as the parcel, only outside the houses) */
function RouteDots() {
  const pts = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(ROUTE_POINTS.map((p) => new THREE.Vector3(...p)), false, 'centripetal')
    return c.getSpacedPoints(60).filter((p) => p.z > 0.85)
  }, [])
  return (
    <>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#F29A1F" transparent opacity={0.55} />
        </mesh>
      ))}
    </>
  )
}

/* Keep both houses in view whatever shape the hero area is */
function CameraRig() {
  const { camera, size } = useThree()
  useLayoutEffect(() => {
    const aspect = size.width / size.height
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    const needW = aspect < 1.5 ? 14.5 : aspect < 2.2 ? 17.5 : 20.5
    const needH = 6.6
    const dist = Math.max(needW / 2 / (tanV * aspect), needH / 2 / tanV)
    camera.position.set(0, 1.7 + dist * 0.3, dist)
    camera.lookAt(0, 1.9, 0.8)
    camera.updateProjectionMatrix()
  }, [camera, size])
  return null
}

function SceneContent() {
  return (
    <>
      <CameraRig />
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 24, 44]} />

      <ambientLight intensity={1.6} />
      <directionalLight
        position={[-5, 9, 7]}
        intensity={2.6}
        color="#FFF2DC"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={9}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[5, 6, -4]} intensity={1.4} color="#E9F3FF" />
      <pointLight position={[-5, 3, 4]} intensity={10} distance={15} color="#FFE9C4" />
      <pointLight position={[5, 3, 3]} intensity={10} distance={15} color="#E6F2FF" />
      <Environment preset="city" />

      {/* Main buildings: the donor (warm) and the shelter (cool) */}
      <Tower position={[-5.25, 0, -0.4]} height={3.7} width={2.65} wall="#F6B26B" trim="#FFF1DC" roof="#C8553D" door="#7A3B1E" openWindow={DONOR_DOOR} />
      <Tower position={[5.2, 0, -0.4]} height={3.25} width={2.7} wall="#7FB7E6" trim="#EAF4FC" roof="#2F6DA3" door="#1F4E79" openWindow={SHELTER_DOOR} glass={['#FFE7B0', '#CFEAFB']} />

      {/* Background buildings */}
      <Tower position={[-8.5, 0, -2.2]} height={2.5} width={1.8} wall="#E9A0B4" trim="#FBE3EA" roof="#B5566F" />
      <Tower position={[8.3, 0, -2.4]} height={2.7} width={1.8} wall="#8FD0A8" trim="#E4F5EA" roof="#2E8B57" />
      <Tower position={[-2.2, 0, -3.4]} height={2.2} width={1.6} wall="#F2D16B" trim="#FFF6D6" roof="#C79A2B" />
      <Tower position={[2.4, 0, -3.6]} height={2.9} width={1.7} wall="#B9A3E3" trim="#EEE8FA" roof="#6D52B0" />

      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.13, 0]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#EDE8DC" roughness={0.95} />
      </mesh>
      {/* Pavement + delivery road */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.118, 0.7]}>
        <planeGeometry args={[18, 1.3]} />
        <meshStandardMaterial color="#DAD3C3" roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.115, 2.1]} receiveShadow>
        <planeGeometry args={[20, 1.7]} />
        <meshStandardMaterial color="#4A4F57" roughness={0.9} />
      </mesh>
      {/* Lane dashes */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[-7.5 + i, -0.105, 2.1]}>
          <boxGeometry args={[0.5, 0.01, 0.06]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}

      <RouteDots />

      {/* People outside the two houses */}
      <Person position={[-3.9, 0, 0.9]} color="#F29A1F" scale={0.75} />
      <Person position={[3.8, 0, 0.85]} color="#2A7DC0" scale={0.75} />
      <Person position={[4.45, 0, 0.9]} color="#D9482B" scale={0.72} />

      <Traffic />
      <Parcel />

      <ContactShadows position={[0, -0.1, 0]} opacity={0.2} scale={24} blur={3.5} far={8} />
    </>
  )
}

export default function Scene() {
  const wrap = useRef(null)
  const inView = useInView(wrap) // stop drawing once the hero has scrolled away

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ position: [0, 6, 16], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}