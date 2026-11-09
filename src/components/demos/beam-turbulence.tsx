import { useEffect, useId, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

// Illustration of a laser beam crossing turbulent air. The side view shows the
// beam bending through drifting eddies; the receiver view shows the spot as a
// Gaussian beam multiplied by a drifting log-normal noise field
// (scintillation), with its center wandering. A qualitative picture only, not
// a physical propagation model and not output from the lab's RIPTIDE code.

const FIELD_W = 240
const FIELD_H = 150
const SIDE_W = 240
const SIDE_H = 56
const PIXEL_SCALE = 3
const TRAIL_LENGTH = 70

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
const noiseC = makeNoise(353)

// Inferno-style colormap as a lookup table (polynomial fit to matplotlib's inferno).
const inferno = (() => {
  const c = [
    [0.000218940369, 0.00165100463, -0.0194808984],
    [0.106513419, 0.563956437, 3.93271239],
    [11.6024931, -3.97285397, -15.9423941],
    [-41.7039961, 17.4363989, 44.3541452],
    [77.1629357, -33.4023589, -81.8073093],
    [-71.3194282, 32.6260643, 73.2095199],
    [25.1311262, -12.242669, -23.070325],
  ]
  const table = new Uint8ClampedArray(256 * 3)
  for (let i = 0; i < 256; i++) {
    const t = i / 255
    for (let k = 0; k < 3; k++) {
      let v = 0
      for (let p = 6; p >= 0; p--) v = v * t + c[p][k]
      table[i * 3 + k] = Math.round(Math.min(1, Math.max(0, v)) * 255)
    }
  }
  return table
})()

function wanderAt(strength: number, time: number) {
  return {
    x: (noiseA(time * 0.6, 3.1) - 0.5) * 50 * strength,
    y: (noiseB(2.7, time * 0.6) - 0.5) * 34 * strength,
  }
}

function drawReceiver(field: ImageData, strength: number, time: number) {
  const data = field.data
  const sigma = strength * 1.15
  const wander = wanderAt(strength, time)
  const cx = FIELD_W / 2 + wander.x
  const cy = FIELD_H / 2 + wander.y
  const radius = 20 + 9 * strength

  for (let y = 0; y < FIELD_H; y++) {
    for (let x = 0; x < FIELD_W; x++) {
      const dx = x - cx
      const dy = y - cy
      const gauss = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius))
      // Three octaves of drifting noise, centered to zero mean.
      const n =
        (noiseA(x * 0.045 + time * 1.1, y * 0.045) - 0.5) * 1.5 +
        (noiseB(x * 0.11, y * 0.11 - time * 1.7) - 0.5) * 0.9 +
        (noiseC(x * 0.26 - time * 2.4, y * 0.26) - 0.5) * 0.5
      const scint = Math.exp(sigma * 2.4 * n - (sigma * sigma) / 2)
      const level = Math.min(1, Math.pow(Math.min(gauss * scint, 1.4) / 1.15, 0.8))
      const index = Math.round(level * 255) * 3
      const i = (y * FIELD_W + x) * 4
      data[i] = inferno[index]
      data[i + 1] = inferno[index + 1]
      data[i + 2] = inferno[index + 2]
      data[i + 3] = 255
    }
  }
  return { x: cx, y: cy, radius }
}

// Faint drifting eddies behind the side view, stronger with turbulence.
function drawEddies(side: ImageData, strength: number, time: number) {
  const data = side.data
  for (let y = 0; y < SIDE_H; y++) {
    for (let x = 0; x < SIDE_W; x++) {
      const n = noiseA(x * 0.06 - time * 0.9, y * 0.09 + 11) * 0.65 + noiseC(x * 0.15 - time * 1.6, y * 0.2) * 0.35
      const swirl = Math.pow(Math.abs(n - 0.5) * 2, 1.6)
      const glow = (0.15 + 0.95 * strength) * swirl
      const i = (y * SIDE_W + x) * 4
      data[i] = 10 + 40 * glow
      data[i + 1] = 16 + 90 * glow
      data[i + 2] = 28 + 150 * glow
      data[i + 3] = 255
    }
  }
}

interface Scene {
  view: CanvasRenderingContext2D
  side: CanvasRenderingContext2D
  fieldCanvas: HTMLCanvasElement
  fieldCtx: CanvasRenderingContext2D
  field: ImageData
  sideCanvas: HTMLCanvasElement
  sideCtx: CanvasRenderingContext2D
  sideImage: ImageData
  trail: { x: number; y: number }[]
}

function render(scene: Scene, strength: number, time: number) {
  const { view, side, fieldCanvas, fieldCtx, field, sideCanvas, sideCtx, sideImage, trail } = scene
  const k = PIXEL_SCALE

  // Receiver view
  const spot = drawReceiver(field, strength, time)
  fieldCtx.putImageData(field, 0, 0)
  view.imageSmoothingEnabled = true
  view.drawImage(fieldCanvas, 0, 0, FIELD_W * k, FIELD_H * k)

  trail.push({ x: spot.x, y: spot.y })
  if (trail.length > TRAIL_LENGTH) trail.shift()

  const midX = (FIELD_W / 2) * k
  const midY = (FIELD_H / 2) * k
  view.save()
  view.strokeStyle = "rgba(160, 210, 255, 0.28)"
  view.lineWidth = 2
  view.setLineDash([8, 12])
  view.beginPath()
  view.moveTo(midX, 0)
  view.lineTo(midX, FIELD_H * k)
  view.moveTo(0, midY)
  view.lineTo(FIELD_W * k, midY)
  view.stroke()
  // Where the spot would sit, and how big, in calm air.
  view.beginPath()
  view.arc(midX, midY, 20 * k, 0, Math.PI * 2)
  view.stroke()
  view.setLineDash([])

  // Wander trail: recent spot centers, fading with age.
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1]
    const b = trail[i]
    view.strokeStyle = `rgba(140, 220, 255, ${(i / trail.length) * 0.75})`
    view.lineWidth = 3.5
    view.beginPath()
    view.moveTo(a.x * k, a.y * k)
    view.lineTo(b.x * k, b.y * k)
    view.stroke()
  }
  view.fillStyle = "#bfe8ff"
  view.beginPath()
  view.arc(spot.x * k, spot.y * k, 6, 0, Math.PI * 2)
  view.fill()

  view.font = "600 22px ui-monospace, monospace"
  view.fillStyle = "rgba(255, 255, 255, 0.55)"
  view.fillText("RECEIVER PLANE", 18, 34)
  view.restore()

  // Side view: transmitter on the left, receiver on the right.
  drawEddies(sideImage, strength, time)
  sideCtx.putImageData(sideImage, 0, 0)
  side.imageSmoothingEnabled = true
  side.drawImage(sideCanvas, 0, 0, SIDE_W * k, SIDE_H * k)

  const sw = SIDE_W * k
  const sh = SIDE_H * k
  const startX = 36
  const endX = sw - 24
  const endOffset = (spot.y - FIELD_H / 2) * k * (sh / (FIELD_H * k)) * 3
  const path: [number, number][] = []
  for (let i = 0; i <= 60; i++) {
    const t = i / 60
    const wobble = (noiseB(t * 6 + time * 0.8, 5.5) - 0.5) * 34 * strength * Math.sin(Math.PI * t)
    path.push([startX + (endX - startX) * t, sh / 2 + endOffset * t * t + wobble])
  }

  side.save()
  side.lineCap = "round"
  // Beam glow widens with distance and with turbulence.
  for (const [width, alpha] of [[30, 0.08], [15, 0.18], [7, 0.45], [3, 0.95]] as const) {
    side.strokeStyle = `rgba(255, 170, 70, ${alpha})`
    side.lineWidth = width * (1 + strength * 0.6)
    side.beginPath()
    path.forEach(([x, y], i) => (i === 0 ? side.moveTo(x, y) : side.lineTo(x, y)))
    side.stroke()
  }
  // Calm-air path for reference
  side.setLineDash([8, 12])
  side.strokeStyle = "rgba(160, 210, 255, 0.4)"
  side.lineWidth = 2
  side.beginPath()
  side.moveTo(startX, sh / 2)
  side.lineTo(endX, sh / 2)
  side.stroke()
  side.setLineDash([])

  side.fillStyle = "#d6dde6"
  side.fillRect(8, sh / 2 - 16, 26, 32)
  side.fillStyle = "rgba(214, 221, 230, 0.8)"
  side.fillRect(endX + 6, sh / 2 - 60, 7, 120)
  side.font = "600 20px ui-monospace, monospace"
  side.fillStyle = "rgba(255, 255, 255, 0.55)"
  side.fillText("LASER", 44, 30)
  side.textAlign = "right"
  side.fillText("RECEIVER", endX - 10, 30)
  side.restore()
}

export function BeamTurbulence() {
  const viewCanvas = useRef<HTMLCanvasElement>(null)
  const sideCanvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<Scene | null>(null)
  const [strength, setStrength] = useState(0.35)
  const strengthRef = useRef(strength)
  const reduceMotion = useReducedMotion()
  const id = useId()

  useEffect(() => {
    strengthRef.current = strength
  }, [strength])

  useEffect(() => {
    const view = viewCanvas.current?.getContext("2d")
    const side = sideCanvas.current?.getContext("2d")
    const fieldCanvas = document.createElement("canvas")
    fieldCanvas.width = FIELD_W
    fieldCanvas.height = FIELD_H
    const sideBuffer = document.createElement("canvas")
    sideBuffer.width = SIDE_W
    sideBuffer.height = SIDE_H
    const fieldCtx = fieldCanvas.getContext("2d")
    const sideCtx = sideBuffer.getContext("2d")
    if (!view || !side || !fieldCtx || !sideCtx || !viewCanvas.current) return

    scene.current = {
      view,
      side,
      fieldCanvas,
      fieldCtx,
      field: fieldCtx.createImageData(FIELD_W, FIELD_H),
      sideCanvas: sideBuffer,
      sideCtx,
      sideImage: sideCtx.createImageData(SIDE_W, SIDE_H),
      trail: [],
    }

    let frame = 0
    let visible = false
    const start = performance.now()
    const draw = () => {
      if (scene.current) render(scene.current, strengthRef.current, (performance.now() - start) / 1000)
      if (visible && !reduceMotion) frame = requestAnimationFrame(draw)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible) draw()
    })
    observer.observe(viewCanvas.current)
    draw()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [reduceMotion])

  // With reduced motion, redraw a still frame whenever the slider moves.
  useEffect(() => {
    if (!reduceMotion || !scene.current) return
    scene.current.trail = []
    render(scene.current, strength, 0)
  }, [strength, reduceMotion])

  const label = strength < 0.15 ? "Calm Air" : strength < 0.5 ? "Moderate Turbulence" : "Strong Turbulence"

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-sm text-white">Laser Through Turbulent Air</p>
        <p className="font-mono text-[11px] text-white/60">{label}</p>
      </div>
      <canvas
        ref={sideCanvas}
        width={SIDE_W * PIXEL_SCALE}
        height={SIDE_H * PIXEL_SCALE}
        className="mt-2 aspect-[240/56] w-full rounded-t-lg bg-[#0a1020]"
        role="img"
        aria-label="Side view of the beam bending as it crosses drifting turbulent eddies"
      />
      <canvas
        ref={viewCanvas}
        width={FIELD_W * PIXEL_SCALE}
        height={FIELD_H * PIXEL_SCALE}
        className="aspect-[240/150] w-full rounded-b-lg border-t border-white/10 bg-black"
        role="img"
        aria-label={`Laser spot at the receiver in ${label.toLowerCase()}: brighter speckles and more drift as turbulence increases`}
      />
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-white/55">
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-sky-200/60" /> Calm-Air Beam
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-sky-300/80" /> Beam Wander
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-gradient-to-r from-[#300a5c] via-[#dd513a] to-[#fcffa4]" /> Intensity
        </span>
      </div>
      <label htmlFor={`${id}-strength`} className="mt-3 block">
        <span className="flex justify-between font-mono text-[11px] text-white/70">
          <span>Turbulence Strength</span>
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
