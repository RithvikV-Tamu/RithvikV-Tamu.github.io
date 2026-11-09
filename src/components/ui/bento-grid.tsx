// Adapted from Magic UI "Bento Grid" (MIT). Link and background are optional,
// and the card text stays visible when a card has no link.
import { type ComponentPropsWithoutRef, type ReactNode } from "react"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className?: string
  background?: ReactNode
  Icon: React.ElementType
  description: string
  meta?: string
  href?: string
  cta?: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div className={cn("grid w-full auto-rows-[18rem] grid-cols-3 gap-4", className)} {...props}>
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  meta,
  href,
  cta = "View code",
  ...props
}: BentoCardProps) => (
  <div
    className={cn(
      "group relative col-span-3 flex flex-col justify-end overflow-hidden rounded-xl",
      "transform-gpu bg-white/[0.02] [border:1px_solid_rgba(255,255,255,.1)] [box-shadow:0_-20px_80px_-20px_#ffffff14_inset]",
      className
    )}
    {...props}
  >
    {background && <div className="absolute inset-0">{background}</div>}
    <div className="relative z-10 flex flex-col gap-1 p-5">
      <Icon className="mb-2 h-9 w-9 text-[#79b9ea]" aria-hidden="true" />
      {meta && <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">{meta}</p>}
      <h3 className="text-xl font-semibold text-neutral-200">{name}</h3>
      <p className="max-w-lg text-sm text-neutral-400">{description}</p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex w-fit items-center text-sm font-medium text-[#79b9ea] hover:underline"
        >
          {cta}
          <ArrowRightIcon className="ms-2 h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-white/[0.03]" />
  </div>
)

export { BentoCard, BentoGrid }
