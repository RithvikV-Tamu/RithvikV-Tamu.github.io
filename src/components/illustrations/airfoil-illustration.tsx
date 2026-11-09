// NACA 4-digit airfoil drawn from the standard thickness and camber equations.
// Used as a generic illustration, not a result from the sailplane study.
function nacaPoints(code: string, count = 80) {
  const m = Number(code[0]) / 100
  const p = Number(code[1]) / 10
  const t = Number(code.slice(2)) / 100
  const upper: [number, number][] = []
  const lower: [number, number][] = []

  for (let i = 0; i <= count; i++) {
    const beta = (Math.PI * i) / count
    const x = (1 - Math.cos(beta)) / 2
    const thickness =
      5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1015 * x ** 4)
    let camber = 0
    let slope = 0
    if (p > 0) {
      if (x < p) {
        camber = (m / p ** 2) * (2 * p * x - x ** 2)
        slope = ((2 * m) / p ** 2) * (p - x)
      } else {
        camber = (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x ** 2)
        slope = ((2 * m) / (1 - p) ** 2) * (p - x)
      }
    }
    const theta = Math.atan(slope)
    upper.push([x - thickness * Math.sin(theta), camber + thickness * Math.cos(theta)])
    lower.push([x + thickness * Math.sin(theta), camber - thickness * Math.cos(theta)])
  }
  return [...upper.reverse(), ...lower]
}

export function AirfoilIllustration({ code = "2412" }: { code?: string }) {
  const scale = 380
  const offsetX = 70
  const offsetY = 120
  const path =
    nacaPoints(code)
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${(offsetX + x * scale).toFixed(1)} ${(offsetY - y * scale).toFixed(1)}`)
      .join(" ") + " Z"

  const streamlines = [-60, -35, 35, 60]

  return (
    <svg viewBox="0 0 520 220" className="h-full w-full" role="img" aria-label={`NACA ${code} airfoil outline`}>
      {streamlines.map((dy) => (
        <path
          key={dy}
          d={`M 10 ${offsetY + dy} C 160 ${offsetY + dy * (dy < 0 ? 1.25 : 0.85)}, 360 ${offsetY + dy * (dy < 0 ? 1.2 : 0.9)}, 510 ${offsetY + dy}`}
          fill="none"
          stroke="#79b9ea"
          strokeOpacity="0.3"
        />
      ))}
      <path d={path} fill="#13233a" stroke="#e8b97a" strokeWidth="1.5" />
      <line x1={offsetX} y1={offsetY} x2={offsetX + scale} y2={offsetY} stroke="#9caab8" strokeDasharray="3 5" strokeOpacity="0.5" />
      <text x="20" y="205" fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">NACA {code} · generic outline</text>
    </svg>
  )
}
