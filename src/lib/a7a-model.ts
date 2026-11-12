// Linearized A-7A Corsair II models from my AERO 321 project (Spring 2026):
// 15,000 ft, Mach 0.6, trim alpha 4 deg. Stability axes throughout. These are
// the corrected, consistent matrices: the submitted report mixed body and
// stability axes. Angles in rad, rates in rad/s, u in ft/s.

import type { Matrix } from "@/lib/state-space"

// Every longitudinal number in one place, so the whole model swaps at once.
// States [u, alpha, q, theta], input elevator. mq is the pitch damping
// derivative Mq (1/s), used by the what-if slider. Seven significant figures:
// the phugoid is sensitive to rounding in the small u and alpha terms.
export const LONGITUDINAL_MODEL: { a: Matrix; b: number[]; mq: number } = {
  a: [
    [-0.0009413927, -31.18776, 0, -32.174],
    [-0.0000354494, -1.161051, 0.9968392, 0],
    [0.001047395, -8.879759, -0.8251692, 0],
    [0, 0, 1, 0],
  ],
  b: [6.967478, -0.1542838, -18.83187, 0],
  mq: -0.6932682,
}

// States [beta, p, r, phi], inputs [aileron, rudder].
export const A_LAT: Matrix = [
  [-0.186971, 0, -1.0, 0.050716],
  [-28.496874, -2.619285, 1.025548, 0],
  [5.195225, 0.032806, -0.60315, 0],
  [0, 1.0, 0, 0],
]
export const B_LAT_AILERON = [-0.006537, 17.799491, 0.148003, 0]
export const B_LAT_RUDDER = [0.054915, 6.856455, -6.053122, 0]

// Yaw damping derivative r_r (1/s). It is A_LAT[2][2] exactly.
export const RR = -0.60315

// In a[2][2], Mq adds to the M_alpha_dot term, so scaling Mq alone shifts
// that entry by (k - 1) * Mq.
export function longitudinal(mqScale: number): Matrix {
  const a = LONGITUDINAL_MODEL.a.map((row) => row.slice())
  a[2][2] += (mqScale - 1) * LONGITUDINAL_MODEL.mq
  return a
}

export function lateral(rrScale: number): Matrix {
  const a = A_LAT.map((row) => row.slice())
  a[2][2] = rrScale * RR
  return a
}
