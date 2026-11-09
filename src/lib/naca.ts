// NACA 4-digit airfoil geometry and thin airfoil theory.
// m = max camber (fraction of chord), p = camber position (fraction), t = thickness (fraction).

export interface NacaParams {
  m: number
  p: number
  t: number
}

function camberSlope({ m, p }: NacaParams, x: number) {
  if (m === 0 || p === 0) return 0
  return x < p ? ((2 * m) / p ** 2) * (p - x) : ((2 * m) / (1 - p) ** 2) * (p - x)
}

function camberLine({ m, p }: NacaParams, x: number) {
  if (m === 0 || p === 0) return 0
  return x < p ? (m / p ** 2) * (2 * p * x - x ** 2) : (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x ** 2)
}

// Closed outline (upper surface trailing edge to leading edge, then lower surface back).
export function nacaOutline(params: NacaParams, count = 90): [number, number][] {
  const upper: [number, number][] = []
  const lower: [number, number][] = []
  for (let i = 0; i <= count; i++) {
    const x = (1 - Math.cos((Math.PI * i) / count)) / 2
    const t = params.t
    const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4)
    const yc = camberLine(params, x)
    const theta = Math.atan(camberSlope(params, x))
    upper.push([x - yt * Math.sin(theta), yc + yt * Math.cos(theta)])
    lower.push([x + yt * Math.sin(theta), yc - yt * Math.cos(theta)])
  }
  return [...upper.reverse(), ...lower]
}

export function camberPoints(params: NacaParams, count = 60): [number, number][] {
  return Array.from({ length: count + 1 }, (_, i) => {
    const x = i / count
    return [x, camberLine(params, x)] as [number, number]
  })
}

// Zero-lift angle of attack from thin airfoil theory, in degrees:
// alpha_L0 = -(1/pi) * integral from 0 to pi of (dz/dx)(cos(theta) - 1) d(theta),
// with x = (1 - cos(theta)) / 2. Evaluated with the midpoint rule.
export function zeroLiftAngleDeg(params: NacaParams, steps = 2000) {
  let sum = 0
  const dTheta = Math.PI / steps
  for (let i = 0; i < steps; i++) {
    const theta = (i + 0.5) * dTheta
    const x = (1 - Math.cos(theta)) / 2
    sum += camberSlope(params, x) * (Math.cos(theta) - 1) * dTheta
  }
  return (-sum / Math.PI) * (180 / Math.PI)
}

export function nacaCode({ m, p, t }: NacaParams) {
  const mDigit = Math.round(m * 100)
  const pDigit = mDigit === 0 ? 0 : Math.round(p * 10)
  return `${mDigit}${pDigit}${String(Math.round(t * 100)).padStart(2, "0")}`
}
