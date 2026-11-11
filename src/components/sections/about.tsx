import { SectionHeading } from "@/components/section-heading"
import { Reveal } from "@/components/reveal"
import { about } from "@/content/site"

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading title="About" />
      <Reveal className="grid gap-12 lg:grid-cols-[3fr_2fr]">
        <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-pretty text-foreground/85">
          {about.paragraphs.map((paragraph, i) => (
            <p key={paragraph} className={i === 0 ? "text-2xl leading-snug font-medium text-foreground sm:text-3xl" : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
        <dl className="grid gap-5 self-start rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6">
          {about.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{fact.label}</dt>
              <dd className="mt-1">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}
