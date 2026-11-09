import { SectionHeading } from "@/components/section-heading"
import { Timeline } from "@/components/ui/timeline"
import { timeline } from "@/content/site"

export function TimelineSection() {
  const data = timeline.map((entry) => ({
    title: entry.title,
    content: (
      <div className="pb-4">
        <h4 className="text-lg font-semibold">{entry.heading}</h4>
        <p className="mt-2 max-w-xl text-muted-foreground">{entry.text}</p>
      </div>
    ),
  }))

  return (
    <section id="timeline" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading stageId="timeline" title="Timeline" />
      <Timeline data={data} />
    </section>
  )
}
