/*
 * Scooter driving logic for the "How it works" scene.
 * Pure maths (no three.js) so it can be tested on its own.
 *
 * Conventions (same as three.js):
 *  - heading h is the rotation.y of the scooter; its nose points along (cos h, 0, -sin h)
 *  - h = 0 drives towards +x (right on screen), h = PI drives towards -x (left on screen)
 *  - two lanes, left-hand traffic like India: +x travel uses the far lane (LANE_A),
 *    -x travel uses the near lane (LANE_B). A U-turn joins the two lanes with a half circle.
 */

export const LANE_A = 1.9 // far lane, travels towards +x
export const LANE_B = 3.1 // near lane, travels towards -x
const MID = (LANE_A + LANE_B) / 2
const R = (LANE_B - LANE_A) / 2 // U-turn radius

export const STATIONS = {
  HOME: { x: -0.5, z: LANE_B, h: Math.PI }, // waiting spot, facing left
  PICK: { x: -2.9, z: LANE_A, h: 0 }, // beside the restaurant counter, facing right
  TABLE: { x: 3.6, z: LANE_A, h: 0 }, // before the community table, facing right
}
const NEXT = { HOME: 'PICK', PICK: 'TABLE', TABLE: 'HOME' }

const CRUISE = 3.5
const TURN_SPEED = 1.7

const wp = (x, z, v = CRUISE) => ({ x, z, v })

/* Half circle at the left end: heading -x on LANE_B, coming back +x on LANE_A */
function uTurnLeft(cx) {
  return [0, 45, 90, 135, 180].map((d) => {
    const a = (d * Math.PI) / 180
    return wp(cx - R * Math.sin(a), MID + R * Math.cos(a), TURN_SPEED)
  })
}
/* Half circle at the right end: heading +x on LANE_A, coming back -x on LANE_B */
function uTurnRight(cx) {
  return [0, 45, 90, 135, 180].map((d) => {
    const a = (d * Math.PI) / 180
    return wp(cx + R * Math.sin(a), MID - R * Math.cos(a), TURN_SPEED)
  })
}

export const LEGS = {
  HOME: [wp(-3.9, LANE_B), ...uTurnLeft(-3.9), wp(STATIONS.PICK.x, LANE_A)],
  PICK: [wp(STATIONS.TABLE.x, LANE_A)],
  TABLE: [wp(5.0, LANE_A), ...uTurnRight(5.0), wp(STATIONS.HOME.x, LANE_B)],
}

const TAU = Math.PI * 2
export const wrap = (a) => {
  a = (a + Math.PI) % TAU
  if (a < 0) a += TAU
  return a - Math.PI
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export function createRider() {
  const s = STATIONS.HOME
  return { x: s.x, z: s.z, h: s.h, v: 0, lean: 0, station: 'HOME', goal: 'HOME', leg: null, idx: 0, wait: 0 }
}

export function setGoal(r, goal) {
  r.goal = goal
}

/* Advance the scooter by dt seconds. Returns a list of events, e.g. 'arrive:PICK'. */
export function stepRider(r, dt) {
  const events = []
  dt = Math.min(dt, 0.05)

  if (r.wait > 0) {
    r.wait -= dt
    r.v = Math.max(0, r.v - 8 * dt)
    r.lean += (0 - r.lean) * Math.min(1, 8 * dt)
    return events
  }

  if (!r.leg) {
    if (r.station === r.goal) {
      // parked: settle onto the station's heading
      const st = STATIONS[r.station]
      r.h = wrap(r.h + wrap(st.h - r.h) * Math.min(1, 6 * dt))
      r.v = Math.max(0, r.v - 8 * dt)
      r.lean += (0 - r.lean) * Math.min(1, 8 * dt)
      return events
    }
    r.leg = LEGS[r.station]
    r.from = r.station
    r.idx = 0
  }

  const last = r.idx === r.leg.length - 1
  const t = r.leg[r.idx]
  const dx = t.x - r.x
  const dz = t.z - r.z
  const dist = Math.hypot(dx, dz)

  // steer towards the waypoint; a limited turn rate makes the U-turn a smooth arc
  const want = Math.atan2(-dz, dx)
  const err = wrap(want - r.h)
  const maxTurn = 3.4 * dt
  const dh = clamp(err, -maxTurn, maxTurn)
  r.h = wrap(r.h + dh)

  // speed: slow for turns and for the final stop, slower still while pointing the wrong way
  let vt = t.v
  if (last) vt = Math.min(vt, 0.25 + dist * 2.2)
  vt *= clamp(1 - Math.abs(err) / 1.6, 0.35, 1)
  const acc = vt > r.v ? 3.2 : 6
  r.v += clamp(vt - r.v, -acc * dt, acc * dt)

  r.x += Math.cos(r.h) * r.v * dt
  r.z += -Math.sin(r.h) * r.v * dt

  // lean into the turn
  r.lean += (clamp(-dh / dt / 3.4, -1, 1) * 0.16 - r.lean) * Math.min(1, 6 * dt)

  const reach = last ? 0.06 : 0.32
  if (dist < reach) {
    if (last) {
      const from = r.from
      r.station = NEXT[from]
      r.leg = null
      r.v = 0
      events.push(`arrive:${r.station}`)
      // pause at the pickup spot when the trip continues, so the crate can be loaded
      if (r.station === 'PICK' && r.goal !== 'PICK') r.wait = 1.7
    } else {
      r.idx++
    }
  }
  return events
}