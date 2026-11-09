// Responsive full-bleed photo from public/media/hero/, served as AVIF with a
// WebP fallback at 1600, 2560 and 3840 px wide.
const widths = [1600, 2560, 3840]
const base = `${import.meta.env.BASE_URL}media/hero/`

const srcSet = (name: string, ext: string) => widths.map((w) => `${base}${name}-${w}.${ext} ${w}w`).join(", ")

interface PhotoProps {
  name: string
  alt: string
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  // Cutout files only exist as WebP.
  webpOnly?: boolean
}

export function Photo({ name, alt, className, style, priority, webpOnly }: PhotoProps) {
  return (
    <picture>
      {!webpOnly && <source type="image/avif" srcSet={srcSet(name, "avif")} sizes="100vw" />}
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes="100vw" />
      <img
        src={`${base}${name}-2560.webp`}
        alt={alt}
        className={className}
        style={style}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
      />
    </picture>
  )
}
