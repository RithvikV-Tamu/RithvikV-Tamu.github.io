import { stages } from "@/content/site"
import { cn } from "@/lib/utils"

interface AltitudeGaugeProps {
  activeIndex: number
  altitudeFt: number
}

const maxAltitude = stages[stages.length - 1].altitudeFt

// Compact fixed rail on the right edge: altitude readout, current stage name,
// and one dot per stage that jumps to its section.
export function AltitudeGauge({ activeIndex, altitudeFt }: AltitudeGaugeProps) {
  const fillPercent = (altitudeFt / maxAltitude) * 100

  return (
    <nav
      aria-label="Page sections"
      className="fixed top-1/2 right-4 z-40 hidden w-20 -translate-y-1/2 flex-col items-center gap-3 min-[1400px]:flex"
    >
      <div className="text-center font-mono" aria-hidden="true">
        <p className="text-[10px] tracking-widest text-muted-foreground">ALT</p>
        <p className="text-sm text-foreground tabular-nums">{(Math.round(altitudeFt / 100) * 100).toLocaleString("en-US")}</p>
        <p className="text-[10px] text-muted-foreground">ft</p>
      </div>

      <div className="relative flex h-56 w-4 justify-center">
        <div className="absolute inset-y-0 w-px bg-white/15" aria-hidden="true" />
        <div
          className="absolute bottom-0 w-px bg-gradient-to-t from-sunlight to-atmosphere transition-[height] duration-200"
          style={{ height: `${fillPercent}%` }}
          aria-hidden="true"
        />
        <ol className="relative flex h-full flex-col-reverse justify-between">
          {stages.map((stage, index) => (
            <li key={stage.id} className="flex">
              <a
                href={`#${stage.id}`}
                title={stage.label}
                aria-label={`${stage.label}: ${stage.nav}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={cn(
                  "block h-2.5 w-2.5 rounded-full border transition-colors",
                  index === activeIndex
                    ? "border-atmosphere bg-atmosphere"
                    : index < activeIndex
                      ? "border-atmosphere/60 bg-background"
                      : "border-white/30 bg-background hover:border-white/70"
                )}
              />
            </li>
          ))}
        </ol>
      </div>

      <p className="text-center font-mono text-[10px] leading-tight tracking-wider text-atmosphere uppercase" aria-hidden="true">
        {stages[activeIndex]?.label}
      </p>
    </nav>
  )
}
