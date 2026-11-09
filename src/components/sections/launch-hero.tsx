import { useEffect, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import { Photo } from "@/components/photo"
import { flightEvents, profile } from "@/content/site"
import { cn } from "@/lib/utils"

// Full-screen photographic launch sequence. The page scroll drives cross-fades
// from the rocket on the pad, to liftoff, ascent and orbital sunrise. The name
// sits between the pad photo and a cutout of the lit rocket, so the rocket
// appears in front of it.

export function LaunchHero() {
  const reduceMotion = useReducedMotion() ?? false
  const section = useRef<HTMLElement>(null)
  const [eventIndex, setEventIndex] = useState(-1)
  const [clock, setClock] = useState(0)

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] })

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

  // Scene timing along the launch scroll (0 to 1).
  const padOpacity = useTransform(p, [0, 0.2, 0.3], [1, 1, 0])
  const padScale = useTransform(p, [0, 0.3], [1, 1.1])
  const nameOpacity = useTransform(p, [0, 0.05, 0.15], [1, 1, 0])
  const nameLift = useTransform(p, [0, 0.15], [0, -50])

  const liftoffOpacity = useTransform(p, [0.18, 0.3, 0.48, 0.58], [0, 1, 1, 0])
  const liftoffScale = useTransform(p, [0.18, 0.58], [1.14, 1])
  const liftoffY = useTransform(p, [0.18, 0.58], ["2%", "-3%"])

  const ascentOpacity = useTransform(p, [0.48, 0.58, 0.7, 0.8], [0, 1, 1, 0])
  const ascentScale = useTransform(p, [0.48, 0.8], [1, 1.4])

  const orbitOpacity = useTransform(p, [0.72, 0.82], [0, 1])
  const orbitScale = useTransform(p, [0.72, 1], [1.25, 1])

  const hintOpacity = useTransform(p, [0, 0.05], [1, 0])
  const endFade = useTransform(p, [0.85, 1], [0, 1])
  const listBacking = useTransform(p, [0.05, 0.15], [0, 1])

  useMotionValueEvent(p, "change", (value) => {
    let index = -1
    flightEvents.forEach((event, i) => {
      if (value >= event.at) index = i
    })
    setEventIndex(index)
    setClock(Math.max(0, Math.round((value - 0.1) * 600)))
  })

  const minutes = Math.floor(clock / 60).toString().padStart(2, "0")
  const seconds = (clock % 60).toString().padStart(2, "0")
  const currentEvent = eventIndex >= 0 ? flightEvents[eventIndex] : null
  const animate = !reduceMotion

  const fill = "absolute inset-0 h-full w-full object-cover"

  return (
    <section id="launch" ref={section} className="relative" style={{ height: animate ? "420vh" : "100svh" }}>
      <div className="sticky top-0 h-svh overflow-hidden bg-black">
        <h1 className="sr-only">{profile.name}</h1>

        {/* Scene 1: on the pad at night, name behind the rocket */}
        <motion.div className="absolute inset-0" style={{ opacity: animate ? padOpacity : 1 }}>
          <motion.div
            className="absolute inset-0"
            initial={animate ? { scale: 1.08 } : false}
            animate={{ scale: 1 }}
            transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div className="absolute inset-[-3%]" style={{ scale: animate ? padScale : 1, x: photoX, y: photoY }}>
              <Photo
                name="pad-night"
                alt="NASA's Artemis I rocket on the launch pad at night, lit by floodlights"
                className={cn(fill, "object-[40%_50%]")}
                priority
              />

              <motion.div
                className="absolute inset-x-0 top-[25%] flex justify-center px-4 sm:top-[15%]"
                style={{ x: nameX, y: nameY, opacity: animate ? nameOpacity : 1 }}
                initial={animate ? { opacity: 0, y: 40 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden="true"
              >
                <motion.p
                  className="bg-gradient-to-b from-white via-white to-[#b7c7dc] bg-clip-text text-center text-[17vw] leading-[0.82] font-bold tracking-[-0.04em] text-transparent sm:text-[15vw] lg:text-[13.5vw]"
                  style={{ y: animate ? nameLift : 0 }}
                >
                  {profile.name.split(" ").map((part) => (
                    <span key={part} className="block">
                      {part.toUpperCase()}
                    </span>
                  ))}
                </motion.p>
              </motion.div>

              <Photo name="pad-night-cutout" alt="" className={cn(fill, "object-[40%_50%]")} priority webpOnly />
            </motion.div>
          </motion.div>
        </motion.div>

        {animate && (
          <>
            {/* Scene 2: liftoff */}
            <motion.div className="absolute inset-0" style={{ opacity: liftoffOpacity }}>
              <motion.div className="absolute inset-0" style={{ scale: liftoffScale, y: liftoffY }}>
                <Photo name="liftoff" alt="Artemis I lifting off in a cloud of steam" className={cn(fill, "object-[62%_50%]")} />
              </motion.div>
            </motion.div>

            {/* Scene 3: ascent, zooming toward the climbing rocket */}
            <motion.div className="absolute inset-0" style={{ opacity: ascentOpacity }}>
              <motion.div className="absolute inset-0 origin-[57%_12%]" style={{ scale: ascentScale }}>
                <Photo name="ascent" alt="Artemis I climbing above the steam cloud, reflected in the water" className={cn(fill, "object-[57%_30%]")} />
              </motion.div>
            </motion.div>

            {/* Scene 4: orbital sunrise */}
            <motion.div className="absolute inset-0" style={{ opacity: orbitOpacity }}>
              <motion.div className="absolute inset-0" style={{ scale: orbitScale }}>
                <Photo name="orbit-sunrise" alt="Sunrise over Earth's horizon seen from the International Space Station" className={cn(fill, "object-[25%_50%]")} />
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Cinematic finish: edge shading and film grain */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="film-grain pointer-events-none absolute inset-0" />
        {animate && (
          <motion.div
            style={{ opacity: listBacking }}
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[26rem] bg-gradient-to-r from-black/70 via-black/35 to-transparent lg:block"
          />
        )}

        {/* Flight events: full list on wide screens, current event on phones */}
        {animate && (
          <>
            <ol className="pointer-events-none absolute top-1/2 left-6 hidden -translate-y-1/2 space-y-4 lg:block xl:left-10">
              {flightEvents.map((event, i) => (
                <li key={event.label} className="max-w-[17rem]">
                  <p
                    className={cn(
                      "font-mono text-[11px] tracking-[0.25em] uppercase transition-colors duration-500",
                      i === eventIndex ? "text-sunlight" : i < eventIndex ? "text-white/60" : "text-white/25"
                    )}
                  >
                    {i < eventIndex ? "✓ " : ""}
                    {event.label}
                  </p>
                  <p
                    className={cn(
                      "overflow-hidden text-sm leading-snug text-white transition-all duration-500 [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]",
                      i === eventIndex ? "mt-1 max-h-16 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    {event.detail}
                  </p>
                </li>
              ))}
            </ol>

            {currentEvent && (
              <div className="pointer-events-none absolute inset-x-6 bottom-24 lg:hidden">
                <p className="font-mono text-[11px] tracking-[0.25em] text-sunlight uppercase">{currentEvent.label}</p>
                <p className="mt-1 text-sm text-white">{currentEvent.detail}</p>
              </div>
            )}

            <div className="pointer-events-none absolute right-6 bottom-6 text-right font-mono text-xs text-white/70 min-[1400px]:right-28">
              <p className="tracking-[0.25em]">MISSION 01</p>
              <p className="mt-1 text-lg text-white tabular-nums">
                T{clock > 0 ? "+" : "−"} {minutes}:{seconds}
              </p>
            </div>

            <motion.div
              style={{ opacity: hintOpacity }}
              className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-white/70 uppercase"
            >
              <span>Scroll to launch</span>
              <span className="h-8 w-px animate-pulse bg-gradient-to-b from-white/60 to-transparent" />
            </motion.div>
          </>
        )}

        <p className="pointer-events-none absolute bottom-6 left-6 max-w-[16rem] font-mono text-[10px] leading-relaxed text-white/45 xl:left-10">
          Photos: NASA (Artemis I, 2022; ISS Expedition 73). Not affiliated with NASA.
        </p>

        {/* Blend the bottom of the last photo into the page background */}
        <motion.div
          style={{ opacity: animate ? endFade : 0 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/80 to-transparent"
        />
      </div>
    </section>
  )
}
