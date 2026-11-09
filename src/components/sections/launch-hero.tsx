import { useEffect, useRef } from "react"
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"
import { ArrowDown } from "lucide-react"
import { Photo } from "@/components/photo"
import { heroFacts, profile } from "@/content/site"
import { cn } from "@/lib/utils"

// Full-screen photo of the rocket on the pad at night. The name sits between
// the photo and a cutout of the lit rocket, so the rocket appears in front of
// it. Scrolling down slides the photo slower than the page and fades it into
// the featured work below; there is no pinned sequence.

export function LaunchHero() {
  const reduceMotion = useReducedMotion() ?? false
  const section = useRef<HTMLElement>(null)
  const animate = !reduceMotion

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end start"] })
  const photoShift = useTransform(p, [0, 1], ["0%", "28%"])
  const photoScale = useTransform(p, [0, 1], [1, 1.08])
  const nameOpacity = useTransform(p, [0, 0.45], [1, 0])
  const nameShift = useTransform(p, [0, 0.45], [0, -60])
  const factsOpacity = useTransform(p, [0, 0.3], [1, 0])

  // Pointer parallax (desktop only), smoothed with springs.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 60, damping: 20 })
  const smoothY = useSpring(pointerY, { stiffness: 60, damping: 20 })
  const photoX = useTransform(smoothX, (v) => v * -14)
  const photoY = useTransform(smoothY, (v) => v * -8)
  const nameX = useTransform(smoothX, (v) => v * 26)
  const nameY = useTransform(smoothY, (v) => v * 14)

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return
    function onMove(event: MouseEvent) {
      pointerX.set((event.clientX / window.innerWidth) * 2 - 1)
      pointerY.set((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [reduceMotion, pointerX, pointerY])

  const fill = "absolute inset-0 h-full w-full object-cover object-[40%_50%]"

  return (
    <section id="launch" ref={section} className="relative h-svh min-h-[560px] overflow-hidden bg-black">
      <h1 className="sr-only">{profile.name}</h1>

      <motion.div className="absolute inset-0" style={animate ? { y: photoShift, scale: photoScale } : undefined}>
        <motion.div
          className="absolute inset-0"
          initial={animate ? { scale: 1.08 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div className="absolute inset-[-3%]" style={{ x: photoX, y: photoY }}>
            <Photo
              name="pad-night"
              alt="NASA's Artemis I rocket on the launch pad at night, lit by floodlights"
              className={fill}
              priority
            />

            <motion.div
              className="absolute inset-x-0 top-[25%] flex justify-center px-4 sm:top-[15%]"
              style={{ x: nameX, y: nameY }}
              initial={animate ? { opacity: 0, y: 40 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              <motion.p
                className="bg-gradient-to-b from-white via-white to-[#b7c7dc] bg-clip-text text-center text-[17vw] leading-[0.82] font-bold tracking-[-0.04em] text-transparent sm:text-[15vw] lg:text-[13.5vw]"
                style={animate ? { opacity: nameOpacity, y: nameShift } : undefined}
              >
                {profile.name.split(" ").map((part) => (
                  <span key={part} className="block">
                    {part.toUpperCase()}
                  </span>
                ))}
              </motion.p>
            </motion.div>

            <Photo name="pad-night-cutout" alt="" className={fill} priority webpOnly />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Edge shading, film grain, and a long fade into the page background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-background via-background/75 to-transparent" />
      <div className="film-grain pointer-events-none absolute inset-0" />

      {/* Data strip: the key facts, visible right away */}
      <motion.div
        className="absolute inset-x-0 bottom-0"
        style={animate ? { opacity: factsOpacity } : undefined}
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-6xl px-6 pb-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-5 lg:grid-cols-4">
            {heroFacts.map((fact, i) => (
              <div key={fact.label} className={cn(i > 1 && "hidden sm:block")}>
                <dt className="font-mono text-[10px] tracking-[0.25em] text-sunlight uppercase">{fact.label}</dt>
                <dd className="mt-1 text-sm leading-snug text-white/90">{fact.detail}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex items-center justify-between gap-4">
            <a
              href="#work"
              className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-white/80 uppercase transition-colors hover:text-white"
            >
              Featured work
              <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
            <p className="text-right font-mono text-[10px] text-white/40">Photo: NASA (Artemis I, 2022). Not affiliated with NASA.</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
