import { useId, useMemo, useState } from "react"
import { B_LAT_AILERON, B_LAT_RUDDER, B_LON, lateral, longitudinal } from "@/lib/a7a-model"
import { eigenvalues, impulseResponse, modal, type Complex, type Matrix } from "@/lib/state-space"
import { cn } from "@/lib/utils"

// Pick a control input to see the A-7A respond to an impulse, and where that
// model's eigenvalues sit in the S-plane. Everything is computed live from the
// state-space matrices in my AERO 321 report. The slider is a what-if: it
// scales one damping derivative and the roots move with it.

type InputKey = "elevator" | "aileron" | "rudder"

interface Trace {
  label: string
  unit: string
  state: number
}

const INPUTS: Record<InputKey, { label: string; b: number[]; duration: number; traces: [Trace, Trace] }> = {
  elevator: {
    label: "Elevator",
    b: B_LON,
    duration: 120,
    traces: [
      { label: "α", unit: "deg", state: 1 },
      { label: "θ", unit: "deg", state: 3 },
    ],
  },
  aileron: {
    label: "Aileron",
    b: B_LAT_AILERON,
    duration: 80,
    traces: [
      { label: "p", unit: "deg/s", state: 1 },
      { label: "φ", unit: "deg", state: 3 },
    ],
  },
  rudder: {
    label: "Rudder",
    b: B_LAT_RUDDER,
    duration: 80,
    traces: [
      { label: "β", unit: "deg", state: 0 },
      { label: "r", unit: "deg/s", state: 2 },
    ],
  },
}

interface Mode {
  name: string
  root: Complex
}

// Name the roots. Longitudinal: the faster complex pair is the short period,
// the slower one the phugoid. Lateral: the complex pair is the Dutch roll, the
// faster real root is roll subsidence and the slower one is the spiral.
function identifyModes(a: Matrix, isLongitudinal: boolean): Mode[] {
  const roots = eigenvalues(a)
  const upper = roots.filter((r) => r.im > 0).sort((x, y) => Math.hypot(y.re, y.im) - Math.hypot(x.re, x.im))
  const real = roots.filter((r) => r.im === 0).sort((x, y) => x.re - y.re)
  if (isLongitudinal && upper.length === 2) {
    return [
      { name: "Short period", root: upper[0] },
      { name: "Phugoid", root: upper[1] },
    ]
  }
  if (!isLongitudinal && upper.length === 1 && real.length === 2) {
    return [
      { name: "Roll", root: real[0] },
      { name: "Dutch roll", root: upper[0] },
      { name: "Spiral", root: real[1] },
    ]
  }
  return [...upper, ...real].map((root, i) => ({ name: `Root ${i + 1}`, root }))
}

const signed = (value: number, digits: number) => `${value < 0 ? "−" : ""}${Math.abs(value).toFixed(digits)}`
const rootText = (r: Complex) => (r.im === 0 ? signed(r.re, 4) : `${signed(r.re, 4)} ± ${Math.abs(r.im).toFixed(4)}j`)

// Rounds a peak value up to 1, 2 or 5 times a power of ten for the axis.
function niceMax(value: number) {
  const power = 10 ** Math.floor(Math.log10(value))
  return [1, 2, 5, 10].map((m) => m * power).find((v) => v >= value) ?? value
}

const PLOT = { w: 520, h: 64, left: 44, right: 10 }

function ResponsePanel({ times, values, trace, color, duration, showAxis }: {
  times: number[]
  values: number[]
  trace: Trace
  color: string
  duration: number
  showAxis: boolean
}) {
  const height = PLOT.h + (showAxis ? 18 : 0)
  const plotW = PLOT.w - PLOT.left - PLOT.right
  const top = 6
  const plotH = PLOT.h - top - 4
  const yMax = niceMax(Math.max(...values.map(Math.abs), 1e-9))
  const x = (t: number) => PLOT.left + (t / duration) * plotW
  const y = (v: number) => top + (1 - (v + yMax) / (2 * yMax)) * plotH
  const path = times.map((t, i) => `${i === 0 ? "M" : "L"}${x(t).toFixed(1)} ${y(values[i]).toFixed(1)}`).join(" ")
  const ticks = Array.from({ length: duration / 20 + 1 }, (_, i) => i * 20)

  return (
    <svg viewBox={`0 0 ${PLOT.w} ${height}`} className="w-full" aria-hidden="true">
      <rect x={PLOT.left} y={top} width={plotW} height={plotH} fill="#ffffff" fillOpacity="0.03" />
      {ticks.map((t) => (
        <line key={t} x1={x(t)} x2={x(t)} y1={top} y2={top + plotH} stroke="#9caab8" strokeOpacity="0.12" />
      ))}
      <line x1={PLOT.left} x2={PLOT.left + plotW} y1={y(0)} y2={y(0)} stroke="#9caab8" strokeOpacity="0.4" />
      {[yMax, -yMax].map((v) => (
        <text key={v} x={PLOT.left - 6} y={y(v) + (v > 0 ? 8 : 0)} textAnchor="end" fill="#9caab8" fontSize="10" fontFamily="var(--font-mono)">
          {signed(v, Number.isInteger(v) ? 0 : 1)}
        </text>
      ))}
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <text x={PLOT.left + plotW - 6} y={top + 13} textAnchor="end" fill="#c3ccd6" fontSize="11" fontFamily="var(--font-mono)">
        {trace.label} ({trace.unit})
      </text>
      {showAxis &&
        ticks.map((t) => (
          <text key={t} x={x(t)} y={height - 4} textAnchor={t === duration ? "end" : "middle"} fill="#9caab8" fontSize="10" fontFamily="var(--font-mono)">
            {t === duration ? `${t} s` : t}
          </text>
        ))}
    </svg>
  )
}

// S-plane bounds per model, wide enough for the whole slider range.
const PLANE = { w: 520, h: 176, left: 14, right: 14, top: 10, bottom: 22 }
const BOUNDS = {
  lon: { re: [-2, 0.4], im: [-3.6, 3.6], reTicks: [-2, -1.5, -1, -0.5, 0], imTicks: [-3, 3] },
  lat: { re: [-3.6, 0.6], im: [-3, 3], reTicks: [-3, -2, -1, 0], imTicks: [-2, 2] },
}

// Where each mode's label sits relative to its upper root, in px.
const LABEL_OFFSET: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  "Short period": { dx: 0, dy: -12, anchor: "middle" },
  Phugoid: { dx: 10, dy: -12, anchor: "start" },
  Roll: { dx: 0, dy: 20, anchor: "middle" },
  "Dutch roll": { dx: -10, dy: 4, anchor: "end" },
  Spiral: { dx: 10, dy: 20, anchor: "start" },
}

function SPlane({ modes, baseline, model }: { modes: Mode[]; baseline: Mode[]; model: "lon" | "lat" }) {
  const b = BOUNDS[model]
  const plotW = PLANE.w - PLANE.left - PLANE.right
  const plotH = PLANE.h - PLANE.top - PLANE.bottom
  const x = (re: number) => PLANE.left + ((re - b.re[0]) / (b.re[1] - b.re[0])) * plotW
  const y = (im: number) => PLANE.top + (1 - (im - b.im[0]) / (b.im[1] - b.im[0])) * plotH
  const clampX = (re: number) => Math.min(Math.max(x(re), PLANE.left + 4), PLANE.left + plotW - 4)
  const cross = (re: number, im: number, size: number) => {
    const cx = clampX(re)
    const cy = y(im)
    return `M${cx - size} ${cy - size} L${cx + size} ${cy + size} M${cx - size} ${cy + size} L${cx + size} ${cy - size}`
  }
  const roots = (list: Mode[]) => list.flatMap((m) => (m.root.im === 0 ? [m.root] : [m.root, { re: m.root.re, im: -m.root.im }]))
  const moved = modes.some((m, i) => Math.abs(m.root.re - (baseline[i]?.root.re ?? m.root.re)) > 1e-6)

  return (
    <svg
      viewBox={`0 0 ${PLANE.w} ${PLANE.h}`}
      className="mt-3 w-full"
      role="img"
      aria-label={`S-plane: ${modes.map((m) => `${m.name} at ${rootText(m.root)}`).join(", ")}`}
    >
      <rect x={PLANE.left} y={PLANE.top} width={plotW} height={plotH} fill="#ffffff" fillOpacity="0.03" />
      <rect x={x(0)} y={PLANE.top} width={PLANE.left + plotW - x(0)} height={plotH} fill="#e8b97a" fillOpacity="0.08" />
      <text x={PLANE.left + plotW - 6} y={PLANE.top + 13} textAnchor="end" fill="#e8b97a" fillOpacity="0.8" fontSize="10" fontFamily="var(--font-mono)">
        Unstable
      </text>
      {b.reTicks.map((re) => (
        <g key={re}>
          <line x1={x(re)} x2={x(re)} y1={PLANE.top} y2={PLANE.top + plotH} stroke="#9caab8" strokeOpacity={re === 0 ? 0.45 : 0.12} />
          <text x={x(re)} y={PLANE.h - 7} textAnchor="middle" fill="#9caab8" fontSize="10" fontFamily="var(--font-mono)">
            {signed(re, re % 1 === 0 ? 0 : 1)}
          </text>
        </g>
      ))}
      <line x1={PLANE.left} x2={PLANE.left + plotW} y1={y(0)} y2={y(0)} stroke="#9caab8" strokeOpacity="0.45" />
      {b.imTicks.map((im) => (
        <g key={im}>
          <line x1={PLANE.left} x2={PLANE.left + plotW} y1={y(im)} y2={y(im)} stroke="#9caab8" strokeOpacity="0.12" />
          <text x={x(0) + 5} y={y(im) + 4} fill="#9caab8" fontSize="10" fontFamily="var(--font-mono)">
            {im > 0 ? `${im}j` : `−${-im}j`}
          </text>
        </g>
      ))}
      <text x={PLANE.left + 6} y={PLANE.top + 13} fill="#c3ccd6" fontSize="11" fontFamily="var(--font-mono)">
        Eigenvalues (1/s)
      </text>

      {moved && <path d={roots(baseline).map((r) => cross(r.re, r.im, 3.5)).join(" ")} stroke="#9caab8" strokeOpacity="0.55" strokeWidth="1.2" />}
      <path d={roots(modes).map((r) => cross(r.re, r.im, 5)).join(" ")} stroke="#e8b97a" strokeWidth="2" strokeLinecap="round" />
      {modes.map((m) => {
        const offset = LABEL_OFFSET[m.name] ?? { dx: 8, dy: -10, anchor: "start" as const }
        return (
          <text
            key={m.name}
            x={clampX(m.root.re) + offset.dx}
            y={y(m.root.im) + offset.dy}
            textAnchor={offset.anchor}
            fill="#e6ebf0"
            fontSize="11"
            fontFamily="var(--font-sans)"
          >
            {m.name}
          </text>
        )
      })}
    </svg>
  )
}

const DT = 0.02
const KEEP_EVERY = 10

export function A7aModes() {
  const [input, setInput] = useState<InputKey>("elevator")
  const [mqScale, setMqScale] = useState(1)
  const [rrScale, setRrScale] = useState(1)
  const id = useId()

  const isLongitudinal = input === "elevator"
  const scale = isLongitudinal ? mqScale : rrScale
  const setScale = isLongitudinal ? setMqScale : setRrScale
  const config = INPUTS[input]

  const a = useMemo(() => (isLongitudinal ? longitudinal(mqScale) : lateral(rrScale)), [isLongitudinal, mqScale, rrScale])
  const modes = useMemo(() => identifyModes(a, isLongitudinal), [a, isLongitudinal])
  const baseline = useMemo(() => identifyModes(isLongitudinal ? longitudinal(1) : lateral(1), isLongitudinal), [isLongitudinal])

  // A 1 deg-s impulse gives the same numbers in degrees as a 1 rad-s impulse
  // gives in radians, because the model is linear.
  const response = useMemo(() => impulseResponse(a, config.b, config.duration, DT, KEEP_EVERY), [a, config])

  // Category B Level I damping limits from Table 8 of the report.
  const check = isLongitudinal
    ? { mode: "Short period", text: "Level I needs 0.30 to 2.00", ok: (z: number) => z >= 0.3 && z <= 2 }
    : { mode: "Dutch roll", text: "Level I needs at least 0.08", ok: (z: number) => z >= 0.08 }
  const checked = modes.find((m) => m.name === check.mode)
  const checkedZeta = checked ? modal(checked.root).zeta : NaN

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Control input" className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {(Object.keys(INPUTS) as InputKey[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={input === key}
              onClick={() => setInput(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                input === key ? "bg-sunlight text-[#05070d]" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {INPUTS[key].label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[11px] text-white/60">{isLongitudinal ? "Longitudinal" : "Lateral-Directional"}</p>
      </div>

      <p className="mt-3 text-xs text-white/70">
        Response to a 1°·s {config.label.toLowerCase()} impulse, {config.duration} s
      </p>
      <div className="mt-1" role="img" aria-label={`Impulse response of ${config.traces.map((t) => t.label).join(" and ")} over ${config.duration} seconds`}>
        {config.traces.map((trace, i) => (
          <ResponsePanel
            key={`${input}-${trace.label}`}
            times={response.times}
            values={response.states.map((s) => s[trace.state])}
            trace={trace}
            color={i === 0 ? "#79b9ea" : "#e8b97a"}
            duration={config.duration}
            showAxis={i === 1}
          />
        ))}
      </div>

      <SPlane modes={modes} baseline={baseline} model={isLongitudinal ? "lon" : "lat"} />

      <table className="mt-2 w-full text-left text-[10px] sm:text-[11px]">
        <thead>
          <tr className="text-white/55">
            <th scope="col" className="py-1 font-normal">Mode</th>
            <th scope="col" className="py-1 font-normal">Eigenvalue</th>
            <th scope="col" className="py-1 pl-2 text-right font-normal">ζ</th>
            <th scope="col" className="py-1 pl-3 text-right font-normal">ωn or τ</th>
          </tr>
        </thead>
        <tbody className="font-mono text-white tabular-nums">
          {modes.map((m) => {
            const p = modal(m.root)
            return (
              <tr key={m.name} className="border-t border-white/10">
                <th scope="row" className="py-1 pr-2 font-sans font-normal whitespace-nowrap text-white/80">
                  {m.name}
                </th>
                <td className="py-1 whitespace-nowrap">{rootText(m.root)}</td>
                <td className="py-1 pl-2 text-right">{m.root.im === 0 ? "–" : signed(p.zeta, 3)}</td>
                <td className="py-1 pl-3 text-right whitespace-nowrap">
                  {m.root.im === 0 ? `τ ${signed(p.tau, p.tau > 10 || p.tau < -10 ? 1 : 3)} s` : `${p.wn.toFixed(p.wn < 1 ? 3 : 2)} rad/s`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <label htmlFor={`${id}-damping`} className="mt-3 block">
        <span className="flex items-baseline justify-between text-[11px] text-white/70">
          <span>
            What-if: {isLongitudinal ? "pitch damping" : "yaw damping"}{" "}
            <span className="font-mono">
              {isLongitudinal ? "M" : "r"}
              <sub>{isLongitudinal ? "q" : "r"}</sub>
            </span>
          </span>
          <span className="font-mono text-white tabular-nums">×{scale.toFixed(2)}</span>
        </span>
        <input
          id={`${id}-damping`}
          type="range"
          min={0}
          max={3}
          step={0.05}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="range-input mt-1 w-full"
        />
      </label>
      <div className="mt-1.5 flex items-baseline justify-between gap-3 text-[11px]">
        <p className="text-white/60">
          {check.mode} ζ{" "}
          <span className={cn("font-mono tabular-nums", check.ok(checkedZeta) ? "text-atmosphere" : "text-sunlight")}>
            {Number.isFinite(checkedZeta) ? checkedZeta.toFixed(3) : "–"}
          </span>
          . {check.text} (Category B).
        </p>
        {scale !== 1 && (
          <button type="button" onClick={() => setScale(1)} className="shrink-0 text-white/70 underline underline-offset-2 hover:text-white">
            Reset
          </button>
        )}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-white/50">
        Linear small-disturbance model from my report. Derivatives from the course aircraft handout. The slider is a what-if on that linear model, not a
        result from the report.
      </p>
    </div>
  )
}
