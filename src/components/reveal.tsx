import { motion } from "motion/react"
import type { ReactNode } from "react"

// Fades content up as it scrolls into view. MotionConfig in App turns this
// into a plain fade for visitors who prefer reduced motion.
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
