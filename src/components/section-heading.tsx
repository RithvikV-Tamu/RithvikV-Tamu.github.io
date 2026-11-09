import { stages } from "@/content/site"

interface SectionHeadingProps {
  stageId: (typeof stages)[number]["id"]
  title: string
  intro?: string
  center?: boolean
}

// Small mission-stage label above a plain section title.
export function SectionHeading({ stageId, title, intro, center = false }: SectionHeadingProps) {
  const index = stages.findIndex((stage) => stage.id === stageId)
  const stage = stages[index]

  return (
    <div className={center ? "mx-auto mb-12 max-w-3xl text-center" : "mb-12 max-w-3xl"}>
      <p className="mb-3 font-mono text-xs tracking-[0.25em] text-atmosphere uppercase">
        {String(index).padStart(2, "0")} · {stage.label}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-muted-foreground">{intro}</p>}
    </div>
  )
}
