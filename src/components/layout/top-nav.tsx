import { FileText, Search } from "lucide-react"
import { motion, useScroll } from "motion/react"
import { profile, stages } from "@/content/site"
import { cn } from "@/lib/utils"

interface TopNavProps {
  activeIndex: number
  onOpenSearch: () => void
}

const navStages = stages.filter((stage) => stage.id !== "launch")

export function TopNav({ activeIndex, onOpenSearch }: TopNavProps) {
  const scrolled = activeIndex > 0
  const { scrollYProgress } = useScroll()

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-white/10 bg-background/70 backdrop-blur-md" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="#launch" className="font-mono text-sm font-semibold tracking-widest">
          RV
        </a>

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {navStages.map((stage) => {
            const isActive = stages[activeIndex]?.id === stage.id
            return (
              <a
                key={stage.id}
                href={`#${stage.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "text-sm transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {stage.nav}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* CV PDF, always one click away */}
          {profile.resumes.map((resume) => (
            <a
              key={resume.href}
              href={resume.href}
              target="_blank"
              rel="noreferrer"
              title={resume.label}
              className="flex items-center gap-1.5 rounded-md border border-sunlight/40 bg-sunlight/10 px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-sunlight/20"
            >
              <FileText className="h-3.5 w-3.5 text-sunlight" aria-hidden="true" />
              {resume.short}
            </a>
          ))}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="max-sm:sr-only md:hidden">Menu</span>
            <span className="hidden md:inline">Jump To</span>
            <kbd className="hidden rounded bg-white/10 px-1.5 font-mono text-[10px] lg:inline">Ctrl K</kbd>
          </button>
        </div>
      </div>
      {/* Scroll progress along the bottom edge of the bar */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-sunlight to-atmosphere"
        style={{ scaleX: scrollYProgress }}
      />
    </header>
  )
}
