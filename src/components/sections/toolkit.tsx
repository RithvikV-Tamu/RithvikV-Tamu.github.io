import { useState } from "react"
import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"
import { sectionIntros, toolkit } from "@/content/site"
import { cn } from "@/lib/utils"

// Tools grouped by area. Hovering or focusing a tool shows where it was used.
export function Toolkit() {
  const [selected, setSelected] = useState<{ name: string; usedIn: string[] } | null>(toolkit[0].tools[0])

  return (
    <section id="toolkit" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading stageId="toolkit" title="Toolkit" intro={sectionIntros.toolkit} />
      <Reveal className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-8 sm:grid-cols-2">
          {toolkit.map((group) => (
            <div key={group.name}>
              <h3 className="mb-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">{group.name}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.tools.map((tool) => (
                  <li key={tool.name}>
                    <button
                      type="button"
                      onMouseEnter={() => setSelected(tool)}
                      onFocus={() => setSelected(tool)}
                      onClick={() => setSelected(tool)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        selected?.name === tool.name
                          ? "border-atmosphere/60 bg-atmosphere/10 text-foreground"
                          : "border-white/10 text-foreground/80 hover:border-white/25"
                      )}
                    >
                      {tool.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          aria-live="polite"
          className="self-start rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:sticky lg:top-28"
        >
          {selected ? (
            <>
              <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Used In</p>
              <p className="mt-1 text-xl font-semibold">{selected.name}</p>
              {selected.usedIn.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm text-foreground/85">
                  {selected.usedIn.map((place) => (
                    <li key={place} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sunlight" aria-hidden="true" />
                      {place}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No project on this page yet.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a tool.</p>
          )}
        </div>
      </Reveal>
    </section>
  )
}
