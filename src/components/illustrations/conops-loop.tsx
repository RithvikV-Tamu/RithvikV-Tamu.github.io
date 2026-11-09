// Concept of operations as a clockwise loop: Earth at the bottom, space at the top.
const steps = [
  { label: "Build and test", angle: 215 },
  { label: "Integrate into carrier", angle: 270 },
  { label: "Launch", angle: 325 },
  { label: "Install on ISS", angle: 35 },
  { label: "~6 months exposure", angle: 90 },
  { label: "Return to PI", angle: 145 },
]

const center = { x: 260, y: 150 }
const radius = 95

function pointAt(angleDeg: number, r: number) {
  const radians = ((angleDeg - 90) * Math.PI) / 180
  return { x: center.x + r * Math.cos(radians), y: center.y + r * Math.sin(radians) }
}

export function ConopsLoop() {
  return (
    <svg viewBox="0 0 520 300" className="h-full w-full" role="img" aria-label="Mission loop: build and test, integrate, launch, install on the ISS, six months of exposure, return to the principal investigator">
      <defs>
        <marker id="conops-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#79b9ea" />
        </marker>
      </defs>
      <path d="M 0 300 Q 260 230 520 300 Z" fill="#13233a" />
      <text x="260" y="292" textAnchor="middle" fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">EARTH</text>
      <text x="260" y="22" textAnchor="middle" fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">ORBIT</text>
      <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke="#79b9ea" strokeOpacity="0.35" strokeDasharray="4 6" />
      {steps.map((step, index) => {
        const next = steps[(index + 1) % steps.length]
        const start = pointAt(step.angle + 10, radius)
        const end = pointAt((next.angle < step.angle ? next.angle + 360 : next.angle) - 10, radius)
        return (
          <path
            key={`arc-${step.label}`}
            d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
            fill="none"
            stroke="#79b9ea"
            strokeWidth="1.5"
            markerEnd="url(#conops-arrow)"
          />
        )
      })}
      {steps.map((step, index) => {
        const dot = pointAt(step.angle, radius)
        const label = pointAt(step.angle, radius + 30)
        const anchor = label.x < center.x - 10 ? "end" : label.x > center.x + 10 ? "start" : "middle"
        return (
          <g key={step.label}>
            <circle cx={dot.x} cy={dot.y} r="11" fill="#05070d" stroke="#e8b97a" />
            <text x={dot.x} y={dot.y + 4} textAnchor="middle" fill="#e8b97a" fontSize="11" fontFamily="var(--font-mono)">
              {index + 1}
            </text>
            <text x={label.x} y={label.y + 4} textAnchor={anchor} fill="#f1f5f9" fontSize="12">
              {step.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
