import { useEffect, useId, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

// Illustration of a laser spot at a receiver as turbulence strength rises.
// The spot is a Gaussian beam multiplied by a drifting log-normal noise field
// (scintillation), and its center wanders. A qualitative picture only, not a
// physical propagation model and not output from the lab's RIPTIDE code.

const W = 256
const H = 160

// Small value-noise generator with a fixed seed so the pattern is stable.
function makeNoise(seed: number) {
  const size = 64
  const grid = new Float32Array(size * size)
  let s = seed
  for (let i = 0; i < grid.length; i++) {
    s = (s * 1664525 + 1013904223) % 4294967296
    grid[i] = s / 4294967296
  }
  const at = (x: number, y: number) => grid[(((y % size) + size) % size) * size + (((x % size) + size) % size)]
  return (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    const top = at(xi, yi) * (1 - u) + at(xi + 1, yi) * u
    const bottom = at(xi, yi + 1) * (1 - u) + at(xi + 1, yi + 1) * u
    return top * (1 - v) + bottom * v
  }
}

const noiseA = makeNoise(7)
const noiseB = makeNoise(91)

function render(ctx: CanvasRenderingContext2D, image: ImageData, strength: number, time: number) {
  const data = image.data
  const sigma = strength * 1.15
  const wanderX = (noiseA(time * 0.6, 3.1) - 0.5) * 54 * strength
  const wanderY = (noiseB(2.7, time * 0.6) - 0.5) * 36 * strength
  const cx = W / 2 + wanderX
  const cy = H / 2 + wanderY
  const radius = 24 + 10 * strength

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx
      const dy = y - cy
      const gauss = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius))
      // Two octaves of drifting noise, centered to zero mean.
      const n =
        (noiseA(x * 0.05 + time * 1.2, y * 0.05) - 0.5) * 1.6 +
        (noiseB(x * 0.12, y * 0.12 - time * 1.8) - 0.5) * 0.9
      const scint = Math.exp(sigma * 2.4 * n - (sigma * sigma) / 2)
      const intensity = Math.min(gauss * scint, 1.6)
      const i = (y * W + x) * 4
      // Warm colormap: black, deep red, orange, pale yellow, white.
      const v = Math.min(intensity / 1.1, 1)
      data[i] = Math.min(255, 620 * v)
      data[i + 1] = Math.min(255, 340 * v * v + 20 * v)
      data[i + 2] = Math.min(255, 270 * v * v * v)
      data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
}

export function BeamTurbulence() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [strength, setStrength] = useState(0.35)
  const strengthRef = useRef(strength)
  const reduceMotion = useReducedMotion()
  const id = useId()

  useEffect(() => {
    strengthRef.current = strength
  }, [strength])

  useEffect(() => {
    const element = canvas.current
    const ctx = element?.getContext("2d")
    if (!element || !ctx) return
    const image = ctx.createImageData(W, H)
    let frame = 0
    let visible = false
    const start = performance.now()

    const draw = () => {
      render(ctx, image, strengthRef.current, (performance.now() - start) / 1000)
      if (visible && !reduceMotion) frame = requestAnimationFrame(draw)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible) draw()
    })
    observer.observe(element)
    draw()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [reduceMotion])

  // With reduced motion, redraw a still frame whenever the slider moves.
  useEffect(() => {
    if (!reduceMotion) return
    const ctx = canvas.current?.getContext("2d")
    if (ctx) render(ctx, ctx.createImageData(W, H), strength, 0)
  }, [strength, reduceMotion])

  const label = strength < 0.15 ? "Calm air" : strength < 0.5 ? "Moderate turbulence" : "Strong turbulence"

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-sm text-white">Beam at the receiver</p>
        <p className="font-mono text-[11px] text-white/60">{label}</p>
      </div>
      <canvas
        ref={canvas}
        width={W}
        height={H}
        className="mt-2 aspect-[16/10] w-full rounded-lg bg-black"
        role="img"
        aria-label={`Illustration of a laser spot in ${label.toLowerCase()}: brighter speckles and more drift as turbulence increases`}
      />
      <label htmlFor={`${id}-strength`} className="mt-3 block">
        <span className="flex justify-between font-mono text-[11px] text-white/70">
          <span>Turbulence strength</span>
          <span className="tabular-nums text-white">{Math.round(strength * 100)}%</span>
        </span>
        <input
          id={`${id}-strength`}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
          className="range-input mt-1 w-full"
        />
      </label>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/50">
        Illustration of scintillation and beam wander. Not a physical model and not RIPTIDE output.
      </p>
    </div>
  )
}
