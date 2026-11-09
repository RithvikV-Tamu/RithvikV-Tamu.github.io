import { useId, useMemo, useState } from "react"
import { camberPoints, nacaCode, nacaOutline, zeroLiftAngleDeg } from "@/lib/naca"

// Drag the sliders to reshape a NACA 4-digit airfoil. The zero-lift angle and
// lift coefficient come from thin airfoil theory (Cl = 2*pi*(alpha - alpha_L0)).

const WIDTH = 520
const HEIGHT = 200
const SCALE = 420
const ORIGIN_X = 50
const ORIGIN_Y = 108

const toPath = (points: [number, number][], close: boolean) =>
  points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${(ORIGIN_X + x * SCALE).toFixed(1)} ${(ORIGIN_Y - y * SCALE).toFixed(1)}`).join(" ") +
  (close ? " Z" : "")

export function AirfoilExplorer() {
  const [camber, setCamber] = useState(2)
  const [position, setPosition] = useState(4)
  const [thickness, setThickness] = useState(12)
  const [alpha, setAlpha] = useState(4)
  const id = useId()

  const params = useMemo(() => ({ m: camber / 100, p: position / 10, t: thickness / 100 }), [camber, position, thickness])
  const outline = useMemo(() => toPath(nacaOutline(params), true), [params])
  const camberLine = useMemo(() => toPath(camberPoints(params), false), [params])
  const alphaL0 = useMemo(() => zeroLiftAngleDeg(params), [params])
  const cl = 2 * Math.PI * ((alpha - alphaL0) * Math.PI) / 180

  const sliders = [
    { key: "camber", label: "Max camber", value: camber, set: setCamber, min: 0, max: 9, unit: "%" },
    { key: "position", label: "Camber position", value: position, set: setPosition, min: 1, max: 9, unit: "0% chord" },
    { key: "thickness", label: "Thickness", value: thickness, set: setThickness, min: 6, max: 24, unit: "%" },
    { key: "alpha", label: "Angle of attack", value: alpha, set: setAlpha, min: -4, max: 12, unit: "°" },
  ]

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-sm text-white">NACA {nacaCode(params)}</p>
        <p className="font-mono text-[11px] text-white/60">thin airfoil theory</p>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-1 w-full" role="img" aria-label={`NACA ${nacaCode(params)} airfoil at ${alpha} degrees angle of attack`}>
        <line x1="0" y1={ORIGIN_Y} x2={WIDTH} y2={ORIGIN_Y} stroke="#9caab8" strokeOpacity="0.25" strokeDasharray="3 5" />
        <g transform={`rotate(${alpha} ${ORIGIN_X + SCALE * 0.25} ${ORIGIN_Y})`} className="transition-transform duration-200">
          <path d={outline} fill="#13233a" stroke="#e8b97a" strokeWidth="1.6" />
          <path d={camberLine} fill="none" stroke="#79b9ea" strokeWidth="1" strokeDasharray="4 4" />
        </g>
        <text x="8" y={HEIGHT - 8} fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">
          flow →
        </text>
      </svg>

      <dl className="mt-1 grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="rounded-md bg-white/5 px-2.5 py-1.5">
          <dt className="text-white/55">Zero-lift angle</dt>
          <dd className="text-sm text-white tabular-nums">{alphaL0.toFixed(2)}°</dd>
        </div>
        <div className="rounded-md bg-white/5 px-2.5 py-1.5">
          <dt className="text-white/55">Lift coefficient</dt>
          <dd className="text-sm text-white tabular-nums">{cl.toFixed(2)}</dd>
        </div>
      </dl>

      <div className="mt-3 grid gap-2.5">
        {sliders.map((s) => {
          const disabled = s.key === "position" && camber === 0
          return (
            <label key={s.key} htmlFor={`${id}-${s.key}`} className={disabled ? "opacity-40" : undefined}>
              <span className="flex justify-between font-mono text-[11px] text-white/70">
                <span>{s.label}</span>
                <span className="tabular-nums text-white">
                  {s.value}
                  {s.unit}
                </span>
              </span>
              <input
                id={`${id}-${s.key}`}
                type="range"
                min={s.min}
                max={s.max}
                step={1}
                value={s.value}
                disabled={disabled}
                onChange={(e) => s.set(Number(e.target.value))}
                className="range-input mt-1 w-full"
              />
            </label>
          )
        })}
      </div>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/50">
        Ideal inviscid lift, valid at small angles. Not results from my sailplane study.
      </p>
    </div>
  )
}
