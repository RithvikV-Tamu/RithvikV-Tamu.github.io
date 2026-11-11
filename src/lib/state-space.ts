// Small linear state-space tools for the A-7A demo: eigenvalues of a 4x4
// matrix, modal parameters, and impulse responses. Plain math, no libraries.

export type Matrix = number[][]

export interface Complex {
  re: number
  im: number
}

const add = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im })
const sub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im })
const mul = (a: Complex, b: Complex): Complex => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re })
const div = (a: Complex, b: Complex): Complex => {
  const d = b.re * b.re + b.im * b.im
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d }
}

function matMul(a: Matrix, b: Matrix): Matrix {
  return a.map((row) => b[0].map((_, j) => row.reduce((sum, value, k) => sum + value * b[k][j], 0)))
}

const trace = (m: Matrix) => m.reduce((sum, row, i) => sum + row[i], 0)

// Characteristic polynomial det(sI - A) by the Faddeev-LeVerrier recursion.
// Returns monic coefficients [1, c1, ..., cn], highest power first.
export function characteristicPolynomial(a: Matrix): number[] {
  const n = a.length
  const identity: Matrix = a.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)))
  const coeffs = [1]
  let m = identity
  for (let k = 1; k <= n; k++) {
    const am = matMul(a, m)
    const c = -trace(am) / k
    coeffs.push(c)
    m = am.map((row, i) => row.map((value, j) => value + c * identity[i][j]))
  }
  return coeffs
}

function evaluate(coeffs: number[], z: Complex): Complex {
  let result: Complex = { re: 0, im: 0 }
  for (const c of coeffs) result = add(mul(result, z), { re: c, im: 0 })
  return result
}

// All roots of a monic polynomial by Durand-Kerner iteration.
export function polynomialRoots(coeffs: number[]): Complex[] {
  const n = coeffs.length - 1
  const seed: Complex = { re: 0.4, im: 0.9 }
  let roots: Complex[] = Array.from({ length: n }, (_, i) => {
    let z: Complex = { re: 1, im: 0 }
    for (let k = 0; k < i; k++) z = mul(z, seed)
    return z
  })
  for (let iter = 0; iter < 500; iter++) {
    let change = 0
    roots = roots.map((root, i) => {
      let denominator: Complex = { re: 1, im: 0 }
      roots.forEach((other, j) => {
        if (j !== i) denominator = mul(denominator, sub(root, other))
      })
      const step = div(evaluate(coeffs, root), denominator)
      change = Math.max(change, Math.hypot(step.re, step.im))
      return sub(root, step)
    })
    if (change < 1e-13) break
  }
  // Clean up round-off: tiny imaginary parts are real roots.
  return roots.map((r) => (Math.abs(r.im) < 1e-9 ? { re: r.re, im: 0 } : r))
}

export const eigenvalues = (a: Matrix) => polynomialRoots(characteristicPolynomial(a))

// zeta and natural frequency for a complex pair, time constant for a real root.
export function modal(root: Complex) {
  const wn = Math.hypot(root.re, root.im)
  return { wn, wd: Math.abs(root.im), zeta: -root.re / wn, tau: -1 / root.re }
}

// Impulse response x(t) = e^{At} b, found by integrating x' = Ax from x(0) = b
// with fourth-order Runge-Kutta. Returns every `keepEvery`-th sample.
export function impulseResponse(a: Matrix, b: number[], duration: number, dt: number, keepEvery: number) {
  const f = (x: number[]) => a.map((row) => row.reduce((sum, value, k) => sum + value * x[k], 0))
  const steps = Math.round(duration / dt)
  const times: number[] = [0]
  const states: number[][] = [b.slice()]
  let x = b.slice()
  for (let i = 1; i <= steps; i++) {
    const k1 = f(x)
    const k2 = f(x.map((v, j) => v + (dt / 2) * k1[j]))
    const k3 = f(x.map((v, j) => v + (dt / 2) * k2[j]))
    const k4 = f(x.map((v, j) => v + dt * k3[j]))
    x = x.map((v, j) => v + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]))
    if (i % keepEvery === 0) {
      times.push(i * dt)
      states.push(x)
    }
  }
  return { times, states }
}
