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

// Small lift curve: Cl against angle of attack from thin airfoil theory, with
// the current angle marked. The slope is 2*pi per radian for every airfoil;
// camber only shifts the line left by moving the zero-lift angle.
const CURVE = { w: 520, h: 120, left: 44, right: 12, top: 10, bottom: 24 }
const ALPHA_RANGE: [number, number] = [-6, 14]
const CL_RANGE: [number, number] = [-0.5, 2.5]

function LiftCurve({ alphaL0, alpha, cl }: { alphaL0: number; alpha: number; cl: number }) {
  const plotW = CURVE.w - CURVE.left - CURVE.right
  const plotH = CURVE.h - CURVE.top - CURVE.bottom
  const x = (a: number) => CURVE.left + ((a - ALPHA_RANGE[0]) / (ALPHA_RANGE[1] - ALPHA_RANGE[0])) * plotW
  const y = (c: number) => CURVE.top + (1 - (c - CL_RANGE[0]) / (CL_RANGE[1] - CL_RANGE[0])) * plotH
  const clAt = (a: number) => 2 * Math.PI * (((a - alphaL0) * Math.PI) / 180)
  const symmetricAt = (a: number) => 2 * Math.PI * ((a * Math.PI) / 180)
  const clip = (c: number) => Math.min(CL_RANGE[1], Math.max(CL_RANGE[0], c))

  return (
    <svg viewBox={`0 0 ${CURVE.w} ${CURVE.h}`} className="mt-3 w-full" role="img" aria-label={`Lift curve. At ${alpha} degrees the lift coefficient is ${cl.toFixed(2)}`}>
      <defs>
        <clipPath id="lift-plot">
          <rect x={CURVE.left} y={CURVE.top} width={plotW} height={plotH} />
        </clipPath>
      </defs>
      <rect x={CURVE.left} y={CURVE.top} width={plotW} height={plotH} fill="#ffffff" fillOpacity="0.03" />
      {[0, 1, 2].map((c) => (
        <g key={c}>
          <line x1={CURVE.left} x2={CURVE.left + plotW} y1={y(c)} y2={y(c)} stroke="#9caab8" strokeOpacity={c === 0 ? 0.4 : 0.15} />
          <text x={CURVE.left - 6} y={y(c) + 4} textAnchor="end" fill="#9caab8" fontSize="10" fontFamily="var(--font-mono)">
            {c.toFixed(1)}
          </text>
        </g>
      ))}
      {[-4, 0, 4, 8, 12].map((a) => (
        <g key={a}>
          <line x1={x(a)} x2={x(a)} y1={CURVE.top} y2={CURVE.top + plotH} stroke="#9caab8" strokeOpacity={a === 0 ? 0.4 : 0.15} />
          <text x={x(a)} y={CURVE.h - 8} textAnchor="middle" fill="#9caab8" fontSize="10" fontFamily="var(--font-mono)">
            {a}°
          </text>
        </g>
      ))}
      <g clipPath="url(#lift-plot)">
        <line x1={x(ALPHA_RANGE[0])} y1={y(symmetricAt(ALPHA_RANGE[0]))} x2={x(ALPHA_RANGE[1])} y2={y(symmetricAt(ALPHA_RANGE[1]))} stroke="#9caab8" strokeOpacity="0.45" strokeDasharray="4 4" />
        <line x1={x(ALPHA_RANGE[0])} y1={y(clAt(ALPHA_RANGE[0]))} x2={x(ALPHA_RANGE[1])} y2={y(clAt(ALPHA_RANGE[1]))} stroke="#79b9ea" strokeWidth="2" />
      </g>
      <circle cx={x(alpha)} cy={y(clip(cl))} r="5" fill="#e8b97a" stroke="#05070d" strokeWidth="1.5" />
      <text x={CURVE.left + 8} y={CURVE.top + 14} fill="#c3ccd6" fontSize="10" fontFamily="var(--font-mono)">
        Cl vs. Angle of Attack
      </text>
      <text x={CURVE.left + plotW - 6} y={CURVE.top + plotH - 8} textAnchor="end" fill="#9caab8" fontSize="10" fontFamily="var(--font-mono)">
        Dashed: Symmetric Airfoil
      </text>
    </svg>
  )
}

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
    { key: "camber", label: "Max Camber", value: camber, set: setCamber, min: 0, max: 9, unit: "%" },
    { key: "position", label: "Camber Position", value: position, set: setPosition, min: 1, max: 9, unit: "0% chord" },
    { key: "thickness", label: "Thickness", value: thickness, set: setThickness, min: 6, max: 24, unit: "%" },
    { key: "alpha", label: "Angle of Attack", value: alpha, set: setAlpha, min: -4, max: 12, unit: "°" },
  ]

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-sm text-white">NACA {nacaCode(params)}</p>
        <p className="font-mono text-[11px] text-white/60">Thin Airfoil Theory</p>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-1 w-full" role="img" aria-label={`NACA ${nacaCode(params)} airfoil at ${alpha} degrees angle of attack`}>
        <line x1="0" y1={ORIGIN_Y} x2={WIDTH} y2={ORIGIN_Y} stroke="#9caab8" strokeOpacity="0.25" strokeDasharray="3 5" />
        <g transform={`rotate(${alpha} ${ORIGIN_X + SCALE * 0.25} ${ORIGIN_Y})`} className="transition-transform duration-200">
          <path d={outline} fill="#13233a" stroke="#e8b97a" strokeWidth="1.6" />
          <path d={camberLine} fill="none" stroke="#79b9ea" strokeWidth="1" strokeDasharray="4 4" />
        </g>
        <text x="8" y={HEIGHT - 8} fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">
          Flow →
        </text>
      </svg>

      <dl className="mt-1 grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="rounded-md bg-white/5 px-2.5 py-1.5">
          <dt className="text-white/55">Zero-Lift Angle</dt>
          <dd className="text-sm text-white tabular-nums">{alphaL0.toFixed(2)}°</dd>
        </div>
        <div className="rounded-md bg-white/5 px-2.5 py-1.5">
          <dt className="text-white/55">Lift Coefficient</dt>
          <dd className="text-sm text-white tabular-nums">{cl.toFixed(2)}</dd>
        </div>
      </dl>

      <LiftCurve alphaL0={alphaL0} alpha={alpha} cl={cl} />

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
