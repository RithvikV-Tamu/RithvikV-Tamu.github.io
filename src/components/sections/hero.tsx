import { useReducedMotion } from "motion/react"
import { ArrowDown } from "lucide-react"
import { GithubIcon } from "@/components/brand-icons"
import { ShootingStars } from "@/components/ui/shooting-stars"
import { StarsBackground } from "@/components/ui/stars-background"
import { profile } from "@/content/site"

export function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="launch" className="relative flex min-h-svh items-center overflow-hidden">
      <StarsBackground starDensity={0.00012} allStarsTwinkle={false} twinkleProbability={reduceMotion ? 0 : 0.5} />
      {!reduceMotion && <ShootingStars starColor="#b7e3ff" trailColor="#79b9ea" minDelay={2500} maxDelay={6000} />}

      <HeroBeam />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <p className="mb-6 font-mono text-xs tracking-[0.3em] text-atmosphere uppercase">00 · Launch</p>
        <h1 className="text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl lg:text-8xl">
          {profile.name.split(" ").map((part) => (
            <span key={part} className="block">
              {part}
            </span>
          ))}
        </h1>
        <p className="mt-8 max-w-xl text-lg text-foreground/90">{profile.tagline}</p>
        {profile.subline && <p className="mt-2 max-w-xl text-muted-foreground">{profile.subline}</p>}

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="#work"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View work
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
          {profile.resume && (
            <a
              href={profile.resume}
              className="inline-flex items-center rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
            >
              Resume
            </a>
          )}
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// A laser beam across the lower part of the hero. An SVG turbulence filter
// bends it slightly, as a nod to the TACL research. Decorative only.
function HeroBeam() {
  const reduceMotion = useReducedMotion()

  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-[4%] h-40 w-full"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="hero-turbulence" x="-5%" y="-50%" width="110%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves="2" seed="3" result="noise">
            {!reduceMotion && (
              <animate attributeName="baseFrequency" dur="12s" values="0.004 0.03;0.006 0.045;0.004 0.03" repeatCount="indefinite" />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" />
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <linearGradient id="hero-beam" x1="0" x2="1">
          <stop offset="0%" stopColor="#e8b97a" stopOpacity="0" />
          <stop offset="15%" stopColor="#e8b97a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e8b97a" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <g filter="url(#hero-turbulence)" className="beam-pulse">
        <path d="M 0 80 L 1200 72 L 1200 92 L 0 82 Z" fill="url(#hero-beam)" />
        <path d="M 0 80 L 1200 78 L 1200 86 L 0 81 Z" fill="#fff4e3" opacity="0.6" />
      </g>
    </svg>
  )
}
