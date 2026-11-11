// Linearized A-7A Corsair II models from my AERO 321 report (Spring 2026):
// 15,000 ft, Mach 0.6, trim alpha 4 deg. Matrices copied from eqs. 33, 34,
// 41 and 42. Angles in rad, rates in rad/s, u in ft/s.

import type { Matrix } from "@/lib/state-space"

// States [u, alpha, q, theta], input elevator.
export const A_LON: Matrix = [
  [0.00063, 20.268177, 0.139873, -32.095626],
  [-0.000035, -1.161652, 0.996847, -0.003538],
  [0.001047, -8.87968, -0.82517, 0.000468],
  [0, 0, 1, 0],
]
export const B_LON = [13.778023, -0.153142, -18.832025, 0]

// States [beta, p, r, phi], inputs [aileron, rudder].
export const A_LAT: Matrix = [
  [-0.186971, 0, -1.0, 0.050593],
  [-27.078927, -2.613645, 0.857828, 0],
  [3.673165, -0.113467, -0.554338, 0],
  [0, 1.0, 0.069927, 0],
]
export const B_LAT_AILERON = [-0.006537, 17.865166, 1.147323, 0]
export const B_LAT_RUDDER = [0.054915, 5.168572, -5.75574, 0]

// Pitch damping derivative Mq from Table 2 (1/s). In A_LON[2][2] it adds to the
// M_alpha_dot term, so scaling Mq alone shifts that entry by (k - 1) * Mq.
export const MQ = -0.693268

// Yaw damping r_r from Table 3 (1/s). It is A_LAT[2][2] exactly.
export const RR = -0.554338

export function longitudinal(mqScale: number): Matrix {
  const a = A_LON.map((row) => row.slice())
  a[2][2] += (mqScale - 1) * MQ
  return a
}

export function lateral(rrScale: number): Matrix {
  const a = A_LAT.map((row) => row.slice())
  a[2][2] = rrScale * RR
  return a
}
