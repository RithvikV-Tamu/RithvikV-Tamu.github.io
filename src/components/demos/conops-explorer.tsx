import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { conopsSteps } from "@/content/site"

// Mission plan as a clockwise loop (Earth at the bottom, orbit at the top).
// Click or tab to a step to read it. While in view it advances on its own,
// and stops once the visitor picks a step.

const angles = [215, 270, 325, 35, 90, 145]
const center = { x: 260, y: 150 }
const radius = 95

function pointAt(angleDeg: number, r: number) {
  const radians = ((angleDeg - 90) * Math.PI) / 180
  return { x: center.x + r * Math.cos(radians), y: center.y + r * Math.sin(radians) }
}

export function ConopsExplorer() {
  const [active, setActive] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const container = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!autoplay || reduceMotion || !container.current) return
    let timer = 0
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer)
      if (entry.isIntersecting) {
        timer = window.setInterval(() => setActive((i) => (i + 1) % conopsSteps.length), 2600)
      }
    })
    observer.observe(container.current)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [autoplay, reduceMotion])

  function choose(index: number) {
    setAutoplay(false)
    setActive(index)
  }

  return (
    <div ref={container}>
      <svg viewBox="0 0 520 300" className="w-full" aria-label="Mission plan loop">
        <defs>
          <marker id="conops-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#79b9ea" />
          </marker>
        </defs>
        <path d="M 0 300 Q 260 230 520 300 Z" fill="#13233a" />
        <text x="260" y="292" textAnchor="middle" fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">EARTH</text>
        <text x="260" y="22" textAnchor="middle" fill="#9caab8" fontSize="11" fontFamily="var(--font-mono)">ORBIT</text>
        <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke="#79b9ea" strokeOpacity="0.25" strokeDasharray="4 6" />

        {angles.map((angle, index) => {
          const nextAngle = angles[(index + 1) % angles.length]
          const start = pointAt(angle + 10, radius)
          const end = pointAt((nextAngle < angle ? nextAngle + 360 : nextAngle) - 10, radius)
          const lit = index === active
          return (
            <path
              key={`arc-${angle}`}
              d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
              fill="none"
              stroke="#79b9ea"
              strokeOpacity={lit ? 1 : 0.45}
              strokeWidth={lit ? 2.2 : 1.4}
              markerEnd="url(#conops-arrow)"
              className="transition-all duration-500"
            />
          )
        })}

        {conopsSteps.map((step, index) => {
          const angle = angles[index]
          const dot = pointAt(angle, radius)
          const label = pointAt(angle, radius + 30)
          const anchor = label.x < center.x - 10 ? "end" : label.x > center.x + 10 ? "start" : "middle"
          const lit = index === active
          return (
            <g
              key={step.label}
              role="button"
              tabIndex={0}
              aria-pressed={lit}
              aria-label={`Step ${index + 1}: ${step.label}`}
              onClick={() => choose(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  choose(index)
                }
              }}
              className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-white"
            >
              <circle cx={dot.x} cy={dot.y} r="20" fill="transparent" />
              <circle
                cx={dot.x}
                cy={dot.y}
                r={lit ? 14 : 11}
                fill={lit ? "#e8b97a" : "#05070d"}
                stroke="#e8b97a"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              <text x={dot.x} y={dot.y + 4} textAnchor="middle" fill={lit ? "#05070d" : "#e8b97a"} fontSize="11" fontFamily="var(--font-mono)" fontWeight="600">
                {index + 1}
              </text>
              <text
                x={label.x}
                y={label.y + 4}
                textAnchor={anchor}
                fill={lit ? "#ffffff" : "#c3ccd6"}
                fontSize="12.5"
                fontWeight={lit ? 600 : 400}
                className="max-sm:hidden"
              >
                {step.label}
              </text>
            </g>
          )
        })}
      </svg>

      <p className="min-h-[2.75rem] text-sm leading-snug text-white" aria-live="polite">
        <span className="mr-2 font-mono text-xs text-sunlight">{String(active + 1).padStart(2, "0")}</span>
        <span className="font-semibold">{conopsSteps[active].label}.</span> {conopsSteps[active].detail}
      </p>
    </div>
  )
}
