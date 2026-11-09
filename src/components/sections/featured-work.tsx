import { CardSpotlight } from "@/components/ui/card-spotlight"
import { AirfoilIllustration } from "@/components/illustrations/airfoil-illustration"
import { BeamIllustration } from "@/components/illustrations/beam-illustration"
import { ConopsLoop } from "@/components/illustrations/conops-loop"
import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"
import { featured, type FeaturedProject } from "@/content/site"
import { cn } from "@/lib/utils"
import blueSkiesRollCage from "@/assets/projects/blue-skies-roll-cage.webp"

const images: Record<string, string> = {
  "blue-skies-roll-cage": blueSkiesRollCage,
}

export function FeaturedWork() {
  return (
    <section id="work" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading stageId="work" title="Featured work" />
      <div className="space-y-28">
        {featured.map((project, index) => (
          <ProjectChapter key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  )
}

function ProjectChapter({ project, index }: { project: FeaturedProject; index: number }) {
  const flip = index % 2 === 1

  return (
    <article id={project.id} className="scroll-mt-24">
      <Reveal className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn(flip && "lg:order-2")}>
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {String(index + 1).padStart(2, "0")} · {project.category}
            {project.dates && ` · ${project.dates}`}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">{project.title}</h3>
          {project.role && <p className="mt-3 text-sm text-atmosphere">{project.role}</p>}
          <p className="mt-5 leading-relaxed text-foreground/85">{project.summary}</p>

          {project.points.length > 0 && (
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {project.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sunlight" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {project.tools.map((tool) => (
              <span key={tool} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-muted-foreground">
                {tool}
              </span>
            ))}
          </div>
          {project.status && <p className="mt-4 font-mono text-xs text-muted-foreground">Status: {project.status}</p>}
        </div>

        <CardSpotlight className={cn("aspect-[13/8] p-4", flip && "lg:order-1")}>
          <ProjectVisual project={project} />
        </CardSpotlight>
      </Reveal>
    </article>
  )
}

function ProjectVisual({ project }: { project: FeaturedProject }) {
  if (project.visual === "image" && project.image) {
    return (
      <figure className="flex h-full flex-col">
        <img
          src={images[project.image.src]}
          alt={project.image.alt}
          loading="lazy"
          className="min-h-0 flex-1 rounded-lg object-cover"
        />
        <figcaption className="mt-2 font-mono text-[11px] text-muted-foreground">{project.image.caption}</figcaption>
      </figure>
    )
  }

  const caption = project.visual === "beam" ? "Illustration only, not simulation data." : project.visual === "conops" ? "Concept of operations, simplified." : ""

  return (
    <figure className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {project.visual === "beam" && <BeamIllustration />}
        {project.visual === "conops" && <ConopsLoop />}
        {project.visual === "airfoil" && <AirfoilIllustration />}
      </div>
      {caption && <figcaption className="mt-2 font-mono text-[11px] text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}
