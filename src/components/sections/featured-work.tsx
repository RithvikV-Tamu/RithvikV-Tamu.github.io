import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { AirfoilIllustration } from "@/components/illustrations/airfoil-illustration"
import { ConopsLoop } from "@/components/illustrations/conops-loop"
import { Photo } from "@/components/photo"
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
    <section id="work">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-4">
        <SectionHeading stageId="work" title="Featured work" />
      </div>
      {featured.map((project, index) => (
        <ProjectPanel key={project.id} project={project} index={index} />
      ))}
    </section>
  )
}

// One project: a full-width photo with slow parallax, a shaded side for the
// text, and a caption that credits the photo and says what it shows.
function ProjectPanel({ project, index }: { project: FeaturedProject; index: number }) {
  const panel = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: panel, offset: ["start end", "end start"] })
  const photoY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"])
  const right = project.photo.textSide === "right"

  return (
    <article id={project.id} ref={panel} className="relative flex min-h-[100svh] scroll-mt-0 items-end overflow-hidden lg:items-center">
      <motion.div className="absolute inset-x-0 -inset-y-[8%]" style={reduceMotion ? undefined : { y: photoY }}>
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
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/10 lg:via-background/70 lg:to-transparent",
          right ? "lg:bg-gradient-to-l" : "lg:bg-gradient-to-r"
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-48 pb-20 lg:py-28">
        <Reveal className={cn("max-w-xl", right && "lg:ml-auto")}>
          <p className="font-mono text-xs tracking-wider text-white/70 uppercase">
            {String(index + 1).padStart(2, "0")} · {project.category}
            {project.dates && ` · ${project.dates}`}
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">{project.title}</h3>
          {project.role && <p className="mt-3 text-sm text-atmosphere">{project.role}</p>}
          <p className="mt-5 leading-relaxed text-white/90">{project.summary}</p>

          {project.points.length > 0 && (
            <ul className="mt-5 space-y-2 text-sm text-white/75">
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
              <span key={tool} className="rounded-full border border-white/20 bg-black/30 px-3 py-1 font-mono text-xs text-white/80 backdrop-blur-sm">
                {tool}
              </span>
            ))}
          </div>
          {project.status && <p className="mt-4 font-mono text-xs text-white/60">Status: {project.status}</p>}

          {project.inset && <ProjectInset project={project} />}

          <p className="mt-8 font-mono text-[10px] leading-relaxed text-white/45 lg:hidden">{project.photo.caption}</p>
        </Reveal>
      </div>

      <p
        className={cn(
          "pointer-events-none absolute bottom-4 hidden max-w-xs font-mono text-[10px] leading-relaxed text-white/45 lg:block",
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
      <figure className="mt-8 max-w-md overflow-hidden rounded-xl border border-white/15 bg-black/40 p-3 backdrop-blur-md">
        <img src={images[project.image.src]} alt={project.image.alt} loading="lazy" className="w-full rounded-lg" />
        <figcaption className="mt-2 font-mono text-[11px] text-white/60">{project.image.caption}</figcaption>
      </figure>
    )
  }

  return (
    <figure className="mt-8 max-w-md rounded-xl border border-white/15 bg-black/45 p-3 backdrop-blur-md">
      <div className="aspect-[13/7]">
        {project.inset === "conops" && <ConopsLoop />}
        {project.inset === "airfoil" && <AirfoilIllustration />}
      </div>
      <figcaption className="mt-1 font-mono text-[11px] text-white/60">
        {project.inset === "conops" ? "Concept of operations, simplified." : "NACA 2412 outline from the standard equations, for illustration."}
      </figcaption>
    </figure>
  )
}
