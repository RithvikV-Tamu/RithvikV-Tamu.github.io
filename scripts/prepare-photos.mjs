// Turns the original NASA photos in .local/originals/ into web-ready files in
// public/media/hero/: AVIF and WebP at three widths, plus a cutout of the lit
// rocket and towers from the pad photo (used to put the name behind them).
//
// Run from the repo root:  node scripts/prepare-photos.mjs
// The originals are not committed. Download links are in docs/PHOTO_CREDITS.md.

import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import path from "node:path"

const sourceDir = ".local/originals"
const outDir = "public/media/hero"
const widths = [1600, 2560, 3840]
const photos = ["pad-night", "liftoff", "ascent", "orbit-sunrise"]

await mkdir(outDir, { recursive: true })

for (const name of photos) {
  const input = path.join(sourceDir, `${name}.jpg`)
  for (const width of widths) {
    const resized = sharp(input).resize({ width, withoutEnlargement: true })
    await resized.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(outDir, `${name}-${width}.avif`))
    await resized.clone().webp({ quality: 80 }).toFile(path.join(outDir, `${name}-${width}.webp`))
  }
  console.log(`photo: ${name}`)
}

// Outline of the rocket stack in the pad photo (normalized 0 to 1), traced by
// hand because the core stage is too dark in shadow for a brightness mask.
const rocketOutline = [
  [0.398, 0.333], [0.401, 0.335], [0.406, 0.36], [0.4095, 0.4], [0.41, 0.495],
  [0.414, 0.491], [0.4185, 0.505], [0.421, 0.53], [0.4215, 0.745],
  [0.369, 0.745], [0.37, 0.53], [0.3725, 0.505], [0.3752, 0.487], [0.378, 0.503], [0.3812, 0.52],
  [0.3825, 0.48], [0.385, 0.445], [0.3886, 0.42], [0.392, 0.4], [0.3945, 0.38], [0.3955, 0.355],
]

// Cutout mask for the pad photo. The traced rocket, warm lit structures (the
// service tower, pad lights) and bright white lattice towers become opaque;
// the night sky stays transparent.
for (const width of widths) {
  const { data, info } = await sharp(path.join(sourceDir, "pad-night.jpg"))
    .resize({ width })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const points = rocketOutline.map(([x, y]) => `${x * info.width},${y * info.height}`).join(" ")
  const outlineSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}">` +
      `<rect width="100%" height="100%" fill="black"/><polygon points="${points}" fill="white"/></svg>`
  )
  const outline = await sharp(outlineSvg).toColourspace("b-w").raw().toBuffer()

  const alpha = Buffer.alloc(info.width * info.height)
  const smoothstep = (edge0, edge1, x) => {
    const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
    return t * t * (3 - 2 * t)
  }

  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3]
    const g = data[i * 3 + 1]
    const b = data[i * 3 + 2]
    const y = Math.floor(i / info.width) / info.height
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    const warmth = smoothstep(8, 40, r - b)
    const bright = smoothstep(95, 150, luminance)
    // Everything below the horizon is foreground too.
    const ground = smoothstep(0.82, 0.86, y)
    alpha[i] = Math.max(Math.round(255 * Math.max(warmth, bright, ground)), outline[i])
  }

  const mask = await sharp(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
    .blur(0.6)
    .toColourspace("b-w")
    .raw()
    .toBuffer()

  await sharp(data, { raw: info })
    .joinChannel(mask, { raw: { width: info.width, height: info.height, channels: 1 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(path.join(outDir, `pad-night-cutout-${width}.webp`))
  console.log(`cutout: ${width}`)
}
