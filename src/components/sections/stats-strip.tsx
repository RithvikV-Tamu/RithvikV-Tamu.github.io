import { Reveal } from "@/components/reveal"
import { quickStats } from "@/content/site"

// A row of short facts between the featured work and the rest of the page.
export function StatsStrip() {
  return (
    <div className="border-y border-white/10 bg-white/[0.015]">
      <Reveal className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="px-2 py-10 lg:px-6">
            <p className="font-mono text-4xl font-semibold text-foreground tabular-nums sm:text-5xl">{stat.value}</p>
            <p className="mt-2 max-w-[14rem] text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </Reveal>
    </div>
  )
}
