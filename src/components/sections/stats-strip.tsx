import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"
import { quickStats } from "@/content/site"

// A row of short facts between the featured work and the rest of the page.
// Numbers count up the first time the row scrolls into view.
export function StatsStrip() {
  const row = useRef<HTMLDivElement>(null)
  const inView = useInView(row, { once: true, margin: "-80px" })

  return (
    <div className="border-y border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
      <div ref={row} className="mx-auto grid max-w-6xl grid-cols-2 px-6 lg:grid-cols-4">
        {quickStats.map((stat, i) => (
          <div key={stat.label} className={i > 0 ? "border-white/10 px-2 py-10 lg:border-l lg:px-8" : "px-2 py-10 lg:pr-8"}>
            <p className="font-mono text-4xl font-semibold text-foreground tabular-nums sm:text-5xl">
              <CountUp to={stat.count} start={inView} from={stat.from ?? 0} />
              <span className="text-sunlight">{stat.suffix}</span>
            </p>
            <p className="mt-2 max-w-[14rem] text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CountUp({ to, from, start }: { to: number; from: number; start: boolean }) {
  const reduceMotion = useReducedMotion()
  const [value, setValue] = useState(reduceMotion ? to : from)

  useEffect(() => {
    if (!start || reduceMotion) return
    const controls = animate(from, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [start, from, to, reduceMotion])

  const shown = reduceMotion ? to : value
  return <>{to >= 10000 ? shown.toLocaleString("en-US") : shown}</>
}
