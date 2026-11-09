// Turns the original photos in .local/originals/ into web-ready files in
// public/media/photos/: AVIF and WebP at three widths.
//
// Run from the repo root:  node scripts/prepare-photos.mjs
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

for (const name of photos) {
  const input = path.join(sourceDir, `${name}.jpg`)
  for (const width of widths) {
    // limitInputPixels is off because the Webb nebula original is 123 megapixels.
    const resized = sharp(input, { limitInputPixels: false }).resize({ width, withoutEnlargement: true })
    await resized.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(outDir, `${name}-${width}.avif`))
    await resized.clone().webp({ quality: 82 }).toFile(path.join(outDir, `${name}-${width}.webp`))
  }
  console.log(`photo: ${name}`)
}
