import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/reveal"
import { about } from "@/content/site"

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading stageId="about" title="About" />
      <Reveal className="grid gap-12 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-5 text-lg leading-relaxed text-foreground/90">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl className="grid gap-5 self-start rounded-xl border border-white/10 bg-white/[0.02] p-6">
          {about.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="font-mono text-xs tracking-wider text-muted-foreground uppercase">{fact.label}</dt>
              <dd className="mt-1">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}
