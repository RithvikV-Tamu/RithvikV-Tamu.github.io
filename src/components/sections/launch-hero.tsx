import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { ArrowDown } from "lucide-react"
import { HeroCanvas } from "@/components/hero/hero-canvas"
import { Photo } from "@/components/photo"
import { heroFacts, profile } from "@/content/site"
import { cn } from "@/lib/utils"

const FONT_FAMILY = '"Saira Stencil One", "Geist Variable", sans-serif'

const photoBase = `${import.meta.env.BASE_URL}media/photos/`
const blurUrl = `${photoBase}jet-twilight-blur.webp`

// Picks the hero texture size for the shader based on screen width.
function heroUrl() {
  const width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.5)
  const size = width <= 1100 ? 1600 : width <= 2200 ? 2560 : 3840
  return `${photoBase}jet-twilight-${size}.webp`
}

// Full-screen hero: an F-22 silhouetted against twilight storm clouds, with
// the name as a backlit silhouette above it. A static photo with a CSS name
// shows first and stays if WebGL is unavailable.
export function LaunchHero() {
  const reduceMotion = useReducedMotion() ?? false
  const section = useRef<HTMLElement>(null)
  const [shaderReady, setShaderReady] = useState(false)
  const [shaderFailed, setShaderFailed] = useState(false)
  const [imageUrl] = useState(heroUrl)
  const upperName = useMemo(() => profile.name.toUpperCase(), [])
  const onReady = useCallback(() => setShaderReady(true), [])
  const onFail = useCallback(() => setShaderFailed(true), [])
  const [hintVisible, setHintVisible] = useState(true)
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches)

  // Hide the hint after the first move (or tap) over the hero.
  useEffect(() => {
    const hide = () => setHintVisible(false)
    window.addEventListener(touch ? "pointerdown" : "pointermove", hide, { once: true })
    return () => window.removeEventListener(touch ? "pointerdown" : "pointermove", hide)
  }, [touch])

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end start"] })
  const contentShift = useTransform(p, [0, 1], ["0%", "26%"])
  const contentFade = useTransform(p, [0.2, 0.9], [1, 0.2])
  const factsOpacity = useTransform(p, [0, 0.3], [1, 0])

  const showStatic = !shaderReady || shaderFailed

  return (
    <section id="launch" ref={section} className="relative h-svh min-h-[560px] overflow-hidden bg-black">
      <h1 className="sr-only">{profile.name}</h1>

      <motion.div className="absolute inset-0" style={reduceMotion ? undefined : { y: contentShift, opacity: contentFade }}>
        {/* Static version: photo plus CSS name. Fades out once the shader is drawing. */}
        <div className={cn("absolute inset-0 transition-opacity duration-1000", showStatic ? "opacity-100" : "opacity-0")} aria-hidden="true">
          <Photo
            name="jet-twilight"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[51%_46%]"
            priority
          />
          <div className="absolute inset-x-0 top-[24%] -translate-y-1/2 px-4 text-center sm:top-[22%]">
            <p className="font-display text-[8vw] leading-[1.15] tracking-[0.05em] text-[#120c08] [text-shadow:0_0_2px_rgba(255,200,130,0.9)] sm:text-[5.6vw]">
              {upperName}
            </p>
          </div>
        </div>

        {!shaderFailed && (
          <div className={cn("absolute inset-0 transition-opacity duration-1000", shaderReady ? "opacity-100" : "opacity-0")}>
            <HeroCanvas
              imageUrl={imageUrl}
              blurUrl={blurUrl}
              name={upperName}
              fontFamily={FONT_FAMILY}
              reduceMotion={reduceMotion}
              onReady={onReady}
              onFail={onFail}
            />
          </div>
        )}
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent" />

      {/* Hint for the sun interaction, gone after the first move */}
      {shaderReady && !shaderFailed && (
        <p
          className={cn(
            "pointer-events-none absolute inset-x-0 top-[38%] text-center text-xs font-medium tracking-[0.24em] text-black/65 uppercase transition-opacity duration-700 sm:top-[33%]",
            hintVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {touch ? "Tap the sky to move the sun" : "Move your cursor to steer the sun"}
        </p>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-background via-background/75 to-transparent" />

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
                <dt className="text-[11px] font-medium tracking-[0.18em] text-sunlight uppercase">{fact.label}</dt>
                <dd className="mt-1 text-sm leading-snug text-white/90">{fact.detail}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex items-center justify-between gap-4">
            <a
              href="#work"
              className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-white/80 uppercase transition-colors hover:text-white"
            >
              Featured work
              <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
            <p className="text-right text-[11px] text-white/45">
              Photo: U.S. Air Force, 2nd Lt. Samuel Eckholm. Not affiliated with the U.S. Air Force.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
