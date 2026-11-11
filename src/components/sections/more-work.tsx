import { ArrowUpRight, Lock } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"
import { moreWork, sectionIntros, type MoreProject } from "@/content/site"

// Smaller projects as a ruled list: name and stack, what it does, and a code link.
export function MoreWork() {
  return (
    <section id="more" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading title="More Work" intro={sectionIntros.more} />
      <Reveal>
        <ul className="border-b border-white/10">
          {moreWork.map((item) => (
            <li key={item.name} className="border-t border-white/10">
              <ProjectRow item={item} />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}

const rowClass = "grid gap-2 py-7 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)_7rem] lg:items-baseline lg:gap-10"

function ProjectRow({ item }: { item: MoreProject }) {
  const body = (
    <>
      <div>
        <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-atmosphere">{item.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>
      </div>
      <p className="max-w-prose leading-relaxed text-pretty text-foreground/75">{item.description}</p>
      {item.href ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-atmosphere lg:justify-self-end">
          View code
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground lg:justify-self-end">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Private
        </span>
      )}
    </>
  )

  if (!item.href) return <div className={rowClass}>{body}</div>

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className={`group -mx-4 rounded-lg px-4 transition-colors hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atmosphere ${rowClass}`}
    >
      {body}
    </a>
  )
}
