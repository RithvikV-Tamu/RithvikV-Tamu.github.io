import { useEffect, useState } from "react"
import { stages } from "@/content/site"

// Tracks which section is at the middle of the screen and turns scroll
// position into a decorative "altitude" between the stage altitudes.
export function useMissionScroll() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [altitudeKm, setAltitudeKm] = useState(0)

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      const middle = window.scrollY + window.innerHeight / 2
      const tops = stages.map((stage) => {
        const element = document.getElementById(stage.id)
        return element ? element.offsetTop : Infinity
      })

      let index = 0
      for (let i = 0; i < tops.length; i++) {
        if (middle >= tops[i]) index = i
      }

      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) {
        setActiveIndex(stages.length - 1)
        setAltitudeKm(stages[stages.length - 1].altitudeKm)
        return
      }

      const start = tops[index]
      const end = tops[index + 1] ?? document.documentElement.scrollHeight
      const reference = index === 0 ? window.scrollY : middle
      const span = Math.max(end - start - (index === 0 ? window.innerHeight / 2 : 0), 1)
      const fraction = Math.min(Math.max((reference - start) / span, 0), 1)
      const fromAlt = stages[index].altitudeKm
      const toAlt = stages[index + 1]?.altitudeKm ?? fromAlt

      setActiveIndex(index)
      setAltitudeKm(Math.round(fromAlt + fraction * (toAlt - fromAlt)))
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return { activeIndex, altitudeKm }
}
