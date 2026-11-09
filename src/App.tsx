import { useState } from "react"
import { MotionConfig } from "motion/react"
import { AltitudeGauge } from "@/components/layout/altitude-gauge"
import { CommandMenu } from "@/components/layout/command-menu"
import { TopNav } from "@/components/layout/top-nav"
import { About } from "@/components/sections/about"
import { Contact } from "@/components/sections/contact"
import { FeaturedWork } from "@/components/sections/featured-work"
import { Hero } from "@/components/sections/hero"
import { MoreWork } from "@/components/sections/more-work"
import { TimelineSection } from "@/components/sections/timeline-section"
import { Toolkit } from "@/components/sections/toolkit"
import { useMissionScroll } from "@/hooks/use-mission-scroll"

function App() {
  const { activeIndex, altitudeKm } = useMissionScroll()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <MotionConfig reducedMotion="user">
      <TopNav activeIndex={activeIndex} onOpenSearch={() => setSearchOpen(true)} />
      <AltitudeGauge activeIndex={activeIndex} altitudeKm={altitudeKm} />
      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
      <main>
        <Hero />
        <About />
        <FeaturedWork />
        <MoreWork />
        <Toolkit />
        <TimelineSection />
        <Contact />
      </main>
    </MotionConfig>
  )
}

export default App
