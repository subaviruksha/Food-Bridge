import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import {
  Float,
  ContactShadows,
  Environment,
  RoundedBox,
} from '@react-three/drei'

// 1. Detailed food donation package
function MealBox() {
  return (
    <group rotation={[0.12, -0.35, 0]}>
      {/* Main kraft food container */}
      <RoundedBox
        args={[1.15, 0.42, 0.9]}
        radius={0.1}
        position={[0, 0, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#E8892B"
          roughness={0.85}
        />
      </RoundedBox>

      {/* Container lid */}
      <RoundedBox
        args={[1.2, 0.09, 0.94]}
        radius={0.06}
        position={[0, 0.25, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#F6C25B"
          roughness={0.7}
        />
      </RoundedBox>

      {/* Lid edge */}
      <mesh position={[0, 0.19, 0]}>
        <boxGeometry args={[1.19, 0.035, 0.93]} />
        <meshStandardMaterial color="#B5651D" roughness={0.8} />
      </mesh>

      {/* Green FoodBridge label */}
      <RoundedBox
        args={[0.48, 0.2, 0.025]}
        radius={0.025}
        position={[0, 0.02, 0.465]}
      >
        <meshStandardMaterial
          color="#1E7A4C"
          roughness={0.5}
        />
      </RoundedBox>

      {/* Small label detail */}
      <mesh position={[0, 0.025, 0.481]}>
        <boxGeometry args={[0.25, 0.025, 0.008]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Side packaging band */}
      <mesh position={[0, 0, -0.46]}>
        <boxGeometry args={[0.18, 0.43, 0.025]} />
        <meshStandardMaterial color="#8A4B21" roughness={0.9} />
      </mesh>
    </group>
  )
}

// 2. Partner restaurant / house
function PartnerHouse() {
  return (
    <group rotation={[0, -0.35, 0]}>
      {/* Building */}
      <RoundedBox
        args={[0.95, 0.85, 0.7]}
        radius={0.035}
        position={[0, -0.12, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#F6B26B"
          roughness={0.85}
        />
      </RoundedBox>

      {/* Roof */}
      <mesh
        position={[0, 0.37, 0]}
        rotation={[0, Math.PI / 4, 0]}
        castShadow
      >
        <coneGeometry args={[0.72, 0.55, 4]} />
        <meshStandardMaterial
          color="#C8553D"
          roughness={0.75}
        />
      </mesh>

      {/* Roof trim */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.08, 0.055, 0.82]} />
        <meshStandardMaterial color="#FFF1DC" />
      </mesh>

      {/* Main door */}
      <mesh position={[0, -0.35, 0.36]}>
        <boxGeometry args={[0.24, 0.48, 0.035]} />
        <meshStandardMaterial
          color="#7A3B1E"
          roughness={0.65}
        />
      </mesh>

      {/* Door glass */}
      <mesh position={[0, -0.32, 0.382]}>
        <planeGeometry args={[0.13, 0.28]} />
        <meshStandardMaterial
          color="#A9D5D8"
          metalness={0.25}
          roughness={0.2}
        />
      </mesh>

      {/* Windows */}
      {[-0.3, 0.3].map((x) => (
        <group key={x} position={[x, 0.02, 0.36]}>
          <mesh>
            <boxGeometry args={[0.22, 0.23, 0.04]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>

          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[0.17, 0.18]} />
            <meshStandardMaterial
              color="#A9D5D8"
              metalness={0.2}
              roughness={0.2}
            />
          </mesh>

          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.018, 0.19, 0.015]} />
            <meshStandardMaterial color="#F6B26B" />
          </mesh>
        </group>
      ))}

      {/* Entrance steps */}
      <RoundedBox
        args={[0.55, 0.09, 0.2]}
        radius={0.025}
        position={[0, -0.57, 0.43]}
      >
        <meshStandardMaterial color="#B5A58D" />
      </RoundedBox>
    </group>
  )
}

// 3. Food delivery scooter
function Scooter() {
  return (
    <group rotation={[0.05, -0.35, 0]}>
      {/* Wheels and wheel hubs */}
      {[-0.48, 0.48].map((x) => (
        <group key={x} position={[x, -0.3, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.14, 32]} />
            <meshStandardMaterial
              color="#252C2B"
              roughness={0.95}
            />
          </mesh>

          <mesh
            position={[0, 0, 0.078]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.105, 0.105, 0.012, 24]} />
            <meshStandardMaterial
              color="#A8ADA5"
              metalness={0.75}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Scooter lower frame */}
      <RoundedBox
        args={[0.95, 0.2, 0.3]}
        radius={0.07}
        position={[0, -0.02, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#2A6FB5"
          metalness={0.25}
          roughness={0.4}
        />
      </RoundedBox>

      {/* Main body */}
      <RoundedBox
        args={[0.32, 0.48, 0.28]}
        radius={0.07}
        position={[0.4, 0.25, 0]}
        rotation={[0, 0, -0.2]}
        castShadow
      >
        <meshStandardMaterial
          color="#2A6FB5"
          metalness={0.15}
          roughness={0.4}
        />
      </RoundedBox>

      {/* Front mudguard */}
      <mesh position={[0.48, -0.08, 0]}>
        <torusGeometry args={[0.22, 0.035, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#2A6FB5" />
      </mesh>

      {/* Handle stem */}
      <mesh
        position={[0.47, 0.55, 0]}
        rotation={[0, 0, -0.2]}
      >
        <cylinderGeometry args={[0.025, 0.025, 0.42, 16]} />
        <meshStandardMaterial
          color="#AAB1AA"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* Handlebar */}
      <mesh position={[0.42, 0.76, 0]}>
        <boxGeometry args={[0.36, 0.035, 0.06]} />
        <meshStandardMaterial
          color="#303936"
          metalness={0.5}
        />
      </mesh>

      {/* Headlight */}
      <mesh position={[0.53, 0.68, 0]}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial
          color="#FFF0BF"
          emissive="#F7C875"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Delivery box */}
      <RoundedBox
        args={[0.42, 0.38, 0.38]}
        radius={0.045}
        position={[-0.15, 0.29, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#F6C25B"
          roughness={0.65}
        />
      </RoundedBox>

      <mesh position={[-0.15, 0.3, 0.197]}>
        <planeGeometry args={[0.22, 0.16]} />
        <meshStandardMaterial color="#2A6FB5" />
      </mesh>
    </group>
  )
}

// 4. Decorative indoor plant
function Plant() {
  return (
    <group>
      {/* Plant pot */}
      <mesh position={[0, -0.28, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.25, 0.48, 32]} />
        <meshStandardMaterial
          color="#A98268"
          roughness={0.85}
        />
      </mesh>

      {/* Pot rim */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.07, 32]} />
        <meshStandardMaterial color="#C09A7B" roughness={0.8} />
      </mesh>

      {/* Soil */}
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[0.29, 0.29, 0.025, 24]} />
        <meshStandardMaterial color="#47392B" roughness={1} />
      </mesh>

      {/* Main stem */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.62, 12]} />
        <meshStandardMaterial color="#557B4D" />
      </mesh>

      {/* Leaves */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = i * (Math.PI / 3)

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.19,
              0.25 + (i % 2) * 0.13,
              Math.sin(angle) * 0.19,
            ]}
            rotation={[
              0.3,
              angle,
              Math.cos(angle) * 0.55,
            ]}
            scale={[0.65, 1.25, 0.4]}
            castShadow
          >
            <sphereGeometry args={[0.2, 24, 16]} />
            <meshStandardMaterial
              color={i % 2 ? '#557B68' : '#83A77D'}
              roughness={0.75}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Main feature visual
export default function FeatureVisual({ kind = 0 }) {
  const Model = [MealBox, PartnerHouse, Scooter, Plant][kind] || MealBox
  const wrap = useRef(null)
  const inView = useInView(wrap) // stop drawing while scrolled out of view (keeps the page smooth)

  return (
    <div ref={wrap} className="h-full w-full">
    <Canvas
      frameloop={inView ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.25, 3.2], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
      shadows
    >
      {/* Natural lighting */}
      <ambientLight intensity={0.85} />

      <directionalLight
        position={[3, 4, 4]}
        intensity={2.2}
        color="#FFF1DA"
        castShadow
      />

      <directionalLight
        position={[-3, 2, -2]}
        intensity={1.1}
        color="#DCEBFA"
      />

      <pointLight
        position={[0, 1.5, 2]}
        intensity={0.8}
        color="#FFE0B0"
      />

      <Environment preset="city" />

      {/* Floating model */}
      <Float
        speed={1.4}
        rotationIntensity={0.12}
        floatIntensity={0.22}
      >
        <Model />
      </Float>

      {/* Soft ground shadow */}
      <ContactShadows
        position={[0, -0.58, 0]}
        opacity={0.4}
        scale={2.8}
        blur={2}
        far={2}
      />
    </Canvas>
    </div>
  )
}