import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { MousePointerClick } from "lucide-react"
import { AirfoilExplorer } from "@/components/demos/airfoil-explorer"
import { BeamTurbulence } from "@/components/demos/beam-turbulence"
import { ConopsExplorer } from "@/components/demos/conops-explorer"
import { Photo } from "@/components/photo"
import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"
import { featured, type FeaturedProject } from "@/content/site"
import { cn } from "@/lib/utils"
import blueSkiesRollCage from "@/assets/projects/blue-skies-roll-cage.webp"

const images: Record<string, string> = {
  "blue-skies-roll-cage": blueSkiesRollCage,
}

const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches

export function FeaturedWork() {
  return (
    <section id="work">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-4">
        <SectionHeading title="Featured Work" center />
      </div>
      {featured.map((project) => (
        <ProjectPanel key={project.id} project={project} />
      ))}
    </section>
  )
}

// One project: a full-width photo with slow parallax, a shaded side for the
// text, and a caption that credits the photo and says what it shows.
function ProjectPanel({ project }: { project: FeaturedProject }) {
  const panel = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: panel, offset: ["start end", "end start"] })
  const photoY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"])
  const photoScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.04])
  const right = project.photo.textSide === "right"

  return (
    <article id={project.id} ref={panel} className="relative flex min-h-[100svh] items-end overflow-hidden lg:items-center">
      <motion.div className="absolute inset-x-0 -inset-y-[8%]" style={reduceMotion ? undefined : { y: photoY, scale: photoScale }}>
        <Photo
          name={project.photo.name}
          alt={project.photo.alt}
          className="h-full w-full object-cover"
          style={{ objectPosition: project.photo.position }}
        />
      </motion.div>

      {/* Shading: from the text side on wide screens, from the bottom on phones,
          plus soft fades at the top and bottom so panels flow into each other */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/10",
          "lg:from-background/95 lg:via-background/70 lg:to-transparent",
          right ? "lg:bg-gradient-to-l" : "lg:bg-gradient-to-r"
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-56 pb-20 lg:py-32">
        <Reveal className={cn("max-w-xl", right && "lg:ml-auto")}>
          <h3 className="text-3xl font-semibold tracking-tight text-balance text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)] sm:text-5xl">
            {project.title}
          </h3>
          {project.role && <p className="mt-4 text-sm font-medium text-atmosphere">{project.role}</p>}
          <p className={cn("text-sm text-white/65", project.role ? "mt-1" : "mt-4")}>
            {project.category}
            {project.dates && ` · ${project.dates}`}
          </p>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-pretty text-white/90">{project.summary}</p>

          {project.points.length > 0 && (
            <ul className="mt-5 space-y-2 text-sm leading-snug text-white/80">
              {project.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-sunlight" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {project.tools.map((tool) => (
              <span key={tool} className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs text-white/85 backdrop-blur-sm">
                {tool}
              </span>
            ))}
            {project.status && <span className="ml-1 text-xs text-white/60">{project.status}</span>}
          </div>

          {project.inset && <ProjectInset project={project} />}

          <p className="mt-8 text-[11px] leading-relaxed text-white/50 lg:hidden">{project.photo.caption}</p>
        </Reveal>
      </div>

      <p
        className={cn(
          "pointer-events-none absolute bottom-4 hidden max-w-xs text-[11px] leading-relaxed text-white/50 lg:block",
          right ? "left-6" : "right-6 text-right"
        )}
      >
        {project.photo.caption}
      </p>
    </article>
  )
}

function ProjectInset({ project }: { project: FeaturedProject }) {
  if (project.inset === "image" && project.image) {
    return (
      <figure className="mt-8 max-w-md overflow-hidden rounded-xl border border-white/15 bg-black/45 p-3 backdrop-blur-md">
        <img src={images[project.image.src]} alt={project.image.alt} loading="lazy" className="w-full rounded-lg" />
        <figcaption className="mt-2 text-xs text-white/60">{project.image.caption}</figcaption>
      </figure>
    )
  }

  const aggie = project.inset === "conops"

  return (
    <div
      className={cn(
        "mt-8 max-w-md rounded-xl border p-4 shadow-2xl shadow-black/40 backdrop-blur-md",
        aggie ? "border-[#8a2a2a]/70 bg-[#1a0606]/75" : "border-white/15 bg-black/55"
      )}
    >
      <p className={cn("mb-3 flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase", aggie ? "text-[#e0b0b0]" : "text-sunlight")}>
        <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
        {touch ? "Tap around" : "Click around"}
      </p>
      {project.inset === "beam" && <BeamTurbulence />}
      {project.inset === "conops" && <ConopsExplorer />}
      {project.inset === "airfoil" && <AirfoilExplorer />}
    </div>
  )
}
