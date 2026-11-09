// Decorative sketch of a laser beam crossing turbulent eddies.
// Not simulation data.
const eddies = [
  { x: 120, y: 70, r: 22 },
  { x: 175, y: 120, r: 14 },
  { x: 230, y: 60, r: 30 },
  { x: 290, y: 130, r: 18 },
  { x: 340, y: 85, r: 10 },
  { x: 380, y: 140, r: 24 },
  { x: 150, y: 165, r: 9 },
  { x: 260, y: 175, r: 12 },
  { x: 320, y: 40, r: 16 },
]

const speckles = [
  { x: 470, y: 98, r: 5, o: 0.9 },
  { x: 478, y: 108, r: 3, o: 0.6 },
  { x: 465, y: 112, r: 4, o: 0.8 },
  { x: 474, y: 90, r: 2.5, o: 0.5 },
  { x: 482, y: 100, r: 2, o: 0.7 },
  { x: 468, y: 122, r: 2, o: 0.4 },
]

export function BeamIllustration() {
  return (
    <svg viewBox="0 0 520 220" className="h-full w-full" role="img" aria-label="Sketch of a laser beam passing through turbulent eddies to a receiver">
      <defs>
        <linearGradient id="beam-fill" x1="0" x2="1">
          <stop offset="0%" stopColor="#e8b97a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e8b97a" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {eddies.map((eddy) => (
        <g key={`${eddy.x}-${eddy.y}`} stroke="#79b9ea" fill="none" opacity="0.35">
          <circle cx={eddy.x} cy={eddy.y} r={eddy.r} />
          <circle cx={eddy.x} cy={eddy.y} r={eddy.r * 0.55} strokeDasharray="3 4" />
        </g>
      ))}
      <path d="M 40 104 L 455 88 L 455 124 L 40 112 Z" fill="url(#beam-fill)" />
      <rect x="22" y="96" width="18" height="24" rx="3" fill="#13233a" stroke="#9caab8" />
      <line x1="458" y1="60" x2="458" y2="160" stroke="#9caab8" strokeDasharray="4 4" />
      {speckles.map((s) => (
        <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} fill="#f1f5f9" opacity={s.o} />
      ))}
      <text x="22" y="140" fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">transmitter</text>
      <text x="420" y="178" fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">receiver plane</text>
      <text x="200" y="212" fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">turbulent eddies</text>
    </svg>
  )
}
