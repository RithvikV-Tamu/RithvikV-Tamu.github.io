import { useState } from "react"
import { MotionConfig } from "motion/react"
import { AltitudeGauge } from "@/components/layout/altitude-gauge"
import { CommandMenu } from "@/components/layout/command-menu"
import { TopNav } from "@/components/layout/top-nav"
import { About } from "@/components/sections/about"
import { Contact } from "@/components/sections/contact"
import { FeaturedWork } from "@/components/sections/featured-work"
import { LaunchHero } from "@/components/sections/launch-hero"
import { MoreWork } from "@/components/sections/more-work"
import { StatsStrip } from "@/components/sections/stats-strip"
import { TimelineSection } from "@/components/sections/timeline-section"
import { Toolkit } from "@/components/sections/toolkit"
import { useMissionScroll } from "@/hooks/use-mission-scroll"

function App() {
  const { activeIndex, altitudeFt } = useMissionScroll()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <MotionConfig reducedMotion="user">
      <TopNav activeIndex={activeIndex} onOpenSearch={() => setSearchOpen(true)} />
      <AltitudeGauge activeIndex={activeIndex} altitudeFt={altitudeFt} />
      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
      <main>
        <LaunchHero />
        <FeaturedWork />
        <StatsStrip />
        <MoreWork />
        <About />
        <Toolkit />
        <TimelineSection />
        <Contact />
      </main>
    </MotionConfig>
  )
}

export default App
