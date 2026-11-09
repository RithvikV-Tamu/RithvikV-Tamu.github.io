// Turns the original photos in .local/originals/ into web-ready files in
// public/media/photos/: AVIF and WebP at three widths, plus a blurred copy of
// the hero photo for the shader's depth of field.
//
// Run from the repo root:   node scripts/prepare-photos.mjs
// Only some photos:         node scripts/prepare-photos.mjs --only=jet-twilight
// Only the blurred map:     node scripts/prepare-photos.mjs --maps
// The originals are not committed. Download links are in docs/PHOTO_CREDITS.md.

import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import path from "node:path"

const sourceDir = ".local/originals"
const outDir = "public/media/photos"
const widths = [1600, 2560, 3840]
const photos = ["jet-twilight", "jet-headon", "tacl-lasers", "spirit-misse", "blue-skies-hurricane", "aircraft-sailplane"]

await mkdir(outDir, { recursive: true })

const mapsOnly = process.argv.includes("--maps")
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="))
const selected = onlyArg ? onlyArg.slice("--only=".length).split(",") : photos

for (const name of mapsOnly ? [] : selected) {
  const input = path.join(sourceDir, `${name}.jpg`)
  for (const width of widths) {
    // limitInputPixels is off because the Hubble and Webb originals are huge.
    const resized = sharp(input, { limitInputPixels: false }).resize({ width, withoutEnlargement: true })
    await resized.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(outDir, `${name}-${width}.avif`))
    await resized.clone().webp({ quality: 82 }).toFile(path.join(outDir, `${name}-${width}.webp`))
  }
  console.log(`photo: ${name}`)
}

// Blurred copy of the hero photo, mixed in by the shader away from the jet.
if (mapsOnly || selected.includes("jet-twilight")) {
  await sharp(path.join(sourceDir, "jet-twilight.jpg"), { limitInputPixels: false })
    .resize({ width: 1600 })
    .blur(9)
    .webp({ quality: 82 })
    .toFile(path.join(outDir, "jet-twilight-blur.webp"))
  console.log("hero: blur map")
}
