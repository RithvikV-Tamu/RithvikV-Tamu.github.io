// Turns the original photos in .local/originals/ into web-ready files in
// public/media/photos/: AVIF and WebP at three widths, plus two extra
// textures for the nebula hero shader.
//
// Run from the repo root:  node scripts/prepare-photos.mjs
// Pass --maps to regenerate only the nebula shader textures (fast).
// The originals are not committed. Download links are in docs/PHOTO_CREDITS.md.

import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import path from "node:path"

const sourceDir = ".local/originals"
const outDir = "public/media/photos"
const widths = [1600, 2560, 3840]
const photos = [
  "nebula-carina",
  "orbit-sunrise",
  "tacl-lasers",
  "spirit-misse",
  "blue-skies-hurricane",
  "aircraft-sailplane",
]

await mkdir(outDir, { recursive: true })

const mapsOnly = process.argv.includes("--maps")

for (const name of mapsOnly ? [] : photos) {
  const input = path.join(sourceDir, `${name}.jpg`)
  for (const width of widths) {
    // limitInputPixels is off because the Webb nebula original is 123 megapixels.
    const resized = sharp(input, { limitInputPixels: false }).resize({ width, withoutEnlargement: true })
    await resized.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(outDir, `${name}-${width}.avif`))
    await resized.clone().webp({ quality: 82 }).toFile(path.join(outDir, `${name}-${width}.webp`))
  }
  console.log(`photo: ${name}`)
}

// Nebula hero textures:
// 1. A blurred copy, mixed into the background for depth of field.
// 2. A foreground mask: everything below the ridge of the dust cliffs is
//    foreground (white), the starfield above it is background (black).
//    The ridge is traced by hand (normalized x, y) because the cliffs carry a
//    blue haze and parts of the sky are dark, which defeats color detection.
const ridgeLine = [
  [0, 0.215], [0.03, 0.21], [0.05, 0.24], [0.08, 0.26], [0.1, 0.27], [0.13, 0.285], [0.16, 0.295],
  [0.18, 0.29], [0.185, 0.275], [0.195, 0.275], [0.2, 0.3], [0.21, 0.35], [0.23, 0.4], [0.25, 0.43],
  [0.27, 0.45], [0.29, 0.455], [0.31, 0.43], [0.33, 0.42], [0.36, 0.405], [0.39, 0.39], [0.42, 0.375],
  [0.44, 0.365], [0.46, 0.365], [0.48, 0.38], [0.5, 0.4], [0.52, 0.415], [0.54, 0.42], [0.57, 0.425],
  [0.6, 0.415], [0.62, 0.43], [0.65, 0.44], [0.68, 0.445], [0.7, 0.43], [0.72, 0.415], [0.75, 0.4],
  [0.78, 0.39], [0.8, 0.37], [0.82, 0.35], [0.84, 0.335], [0.87, 0.33], [0.9, 0.33], [0.92, 0.31],
  [0.94, 0.28], [0.96, 0.255], [0.98, 0.235], [1, 0.22],
]
{
  const input = path.join(sourceDir, "nebula-carina.jpg")
  await sharp(input, { limitInputPixels: false })
    .resize({ width: 1600 })
    .blur(7)
    .webp({ quality: 80 })
    .toFile(path.join(outDir, "nebula-carina-blur.webp"))

  const width = 1024
  const height = Math.round(width * (8441 / 14575))
  const points = [...ridgeLine, [1, 1], [0, 1]].map(([x, y]) => `${(x * width).toFixed(1)},${(y * height).toFixed(1)}`).join(" ")
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<rect width="100%" height="100%" fill="black"/><polygon points="${points}" fill="white"/></svg>`
  )
  await sharp(svg)
    .blur(1.2)
    .toColourspace("b-w")
    .png()
    .toFile(path.join(outDir, "nebula-carina-fg.png"))
  console.log("nebula: blur map and foreground mask")
}
