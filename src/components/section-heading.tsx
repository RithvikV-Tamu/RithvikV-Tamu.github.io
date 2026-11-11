interface SectionHeadingProps {
  title: string
  intro?: string
  center?: boolean
}

// Plain section title. The flight-stage names live on the altitude gauge.
export function SectionHeading({ title, intro, center = false }: SectionHeadingProps) {
  return (
    <div className={center ? "mx-auto mb-12 max-w-3xl text-center" : "mb-12 max-w-3xl"}>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-muted-foreground">{intro}</p>}
    </div>
  )
}
