import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"
import { timeline } from "@/content/site"
import { cn } from "@/lib/utils"

// A compact logbook: date, what happened, and a line of detail.
export function TimelineSection() {
  return (
    <section id="timeline" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading title="Timeline" />
      <Reveal>
        <ol className="border-b border-white/10">
          {timeline.map((entry) => (
            <li
              key={entry.title}
              className={cn(
                "grid gap-1 border-t py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-10",
                entry.upcoming ? "border-dashed border-white/15" : "border-white/10"
              )}
            >
              <p className={cn("font-mono text-sm tabular-nums", entry.upcoming ? "text-muted-foreground" : "text-sunlight")}>
                {entry.title}
                {entry.upcoming && <span className="ml-2 font-sans text-xs tracking-wide uppercase">Upcoming</span>}
              </p>
              <div>
                <h3 className="text-lg font-semibold">{entry.heading}</h3>
                <p className="mt-1.5 max-w-2xl leading-relaxed text-muted-foreground">{entry.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  )
}
