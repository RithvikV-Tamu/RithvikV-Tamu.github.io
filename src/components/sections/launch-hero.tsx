import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { ArrowDown } from "lucide-react"
import { NebulaCanvas } from "@/components/hero/nebula-canvas"
import { Photo } from "@/components/photo"
import { heroFacts, profile } from "@/content/site"
import { cn } from "@/lib/utils"

const FONT_FAMILY = '"Michroma", "Geist Variable", sans-serif'

const photoBase = `${import.meta.env.BASE_URL}media/photos/`
const blurUrl = `${photoBase}nebula-carina-blur.webp`
const depthUrl = `${photoBase}nebula-carina-fg.png`

// Picks the nebula texture size for the shader based on screen width.
function nebulaUrl() {
  const width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.5)
  const size = width <= 1100 ? 1600 : width <= 2200 ? 2560 : 3840
  return `${photoBase}nebula-carina-${size}.webp`
}

// Full-screen hero: Webb's "Cosmic Cliffs" nebula with the name drawn into it
// and a small black hole that bends the image around the cursor. A static
// photo with a CSS name shows first and stays if WebGL is unavailable.
export function LaunchHero() {
  const reduceMotion = useReducedMotion() ?? false
  const section = useRef<HTMLElement>(null)
  const [shaderReady, setShaderReady] = useState(false)
  const [shaderFailed, setShaderFailed] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const [imageUrl] = useState(nebulaUrl)
  const lines = useMemo(() => profile.name.toUpperCase().split(" "), [])
  const onReady = useCallback(() => setShaderReady(true), [])
  const onFail = useCallback(() => setShaderFailed(true), [])

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end start"] })
  const contentShift = useTransform(p, [0, 1], ["0%", "26%"])
  const contentFade = useTransform(p, [0.2, 0.9], [1, 0.2])
  const factsOpacity = useTransform(p, [0, 0.3], [1, 0])

  // Hide the cursor hint after the first pointer movement.
  useEffect(() => {
    const hide = () => setHintVisible(false)
    window.addEventListener("pointermove", hide, { once: true })
    return () => window.removeEventListener("pointermove", hide)
  }, [])

  const showStatic = !shaderReady || shaderFailed

  return (
    <section id="launch" ref={section} className="relative h-svh min-h-[560px] overflow-hidden bg-black">
      <h1 className="sr-only">{profile.name}</h1>

      <motion.div className="absolute inset-0" style={reduceMotion ? undefined : { y: contentShift, opacity: contentFade }}>
        {/* Static version: photo plus CSS name. Fades out once the shader is drawing. */}
        <div className={cn("absolute inset-0 transition-opacity duration-1000", showStatic ? "opacity-100" : "opacity-0")} aria-hidden="true">
          <Photo
            name="nebula-carina"
            alt=""
            className="absolute inset-0 h-full w-full scale-[1.08] object-cover object-[50%_36%] brightness-[0.82]"
            priority
          />
          <div className="absolute inset-x-0 top-[33%] -translate-y-1/2 px-4 text-center sm:top-[30%]">
            <p className="font-display text-[9.5vw] leading-[1.08] tracking-[0.05em] text-white [text-shadow:0_6px_24px_rgba(0,0,0,0.7)] lg:text-[8.6vw]">
              {lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>

        {!shaderFailed && (
          <div className={cn("absolute inset-0 transition-opacity duration-1000", shaderReady ? "opacity-100" : "opacity-0")}>
            <NebulaCanvas
              imageUrl={imageUrl}
              blurUrl={blurUrl}
              depthUrl={depthUrl}
              lines={lines}
              fontFamily={FONT_FAMILY}
              reduceMotion={reduceMotion}
              onReady={onReady}
              onFail={onFail}
            />
          </div>
        )}
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-background via-background/70 to-transparent" />

      {/* Cursor hint, gone after the first move */}
      {shaderReady && !shaderFailed && (
        <p
          className={cn(
            "pointer-events-none absolute inset-x-0 top-[58%] text-center font-mono text-[11px] tracking-[0.3em] text-white/60 uppercase transition-opacity duration-700 max-lg:hidden",
            hintVisible ? "opacity-100" : "opacity-0"
          )}
        >
          Move your cursor across the nebula
        </p>
      )}

      {/* Data strip: the key facts, visible right away */}
      <motion.div
        className="absolute inset-x-0 bottom-0"
        style={reduceMotion ? undefined : { opacity: factsOpacity }}
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
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
            <p className="text-right font-mono text-[10px] text-white/40">
              Image: NASA, ESA, CSA, STScI (Webb, CC BY 4.0). Not affiliated with NASA.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
