import { Activity, Bot, Flame, LayoutDashboard, LineChart, Rocket } from "lucide-react"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"
import { moreWork, type MoreIcon } from "@/content/site"

const icons: Record<MoreIcon, React.ElementType> = {
  nozzle: Rocket,
  heat: Flame,
  wave: Activity,
  bot: Bot,
  dashboard: LayoutDashboard,
  chart: LineChart,
}

export function MoreWork() {
  return (
    <section id="more" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading stageId="more" title="More work" intro="Solvers, machine learning and software tools. Public repositories are linked." />
      <Reveal>
        <BentoGrid className="lg:auto-rows-[17rem]">
          {moreWork.map((item) => (
            <BentoCard
              key={item.name}
              name={item.name}
              meta={item.meta}
              description={item.description}
              Icon={icons[item.icon]}
              href={item.href}
              className={item.size === "wide" ? "lg:col-span-2" : "lg:col-span-1"}
            />
          ))}
        </BentoGrid>
      </Reveal>
    </section>
  )
}
