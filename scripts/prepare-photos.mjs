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

// Pass --maps to regenerate only the nebula blur and depth maps (fast).
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

// Extra textures for the nebula hero shader.
// 1. A blurred copy, mixed in for depth of field.
// 2. A depth map: orange dust is near (bright), the blue starfield is far
//    (black), and dust lower in the frame is nearer than dust at the ridge.
//    The shader slices this into stacked "paper" layers.
{
  const input = path.join(sourceDir, "nebula-carina.jpg")
  await sharp(input, { limitInputPixels: false })
    .resize({ width: 1600 })
    .blur(7)
    .webp({ quality: 80 })
    .toFile(path.join(outDir, "nebula-carina-blur.webp"))

  const { data, info } = await sharp(input, { limitInputPixels: false })
    .resize({ width: 1024 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const smoothstep = (a, b, x) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
    return t * t * (3 - 2 * t)
  }
  // Large-scale brightness, so layer edges follow the cloud structures.
  const glow = await sharp(input, { limitInputPixels: false })
    .resize({ width: 1024 })
    .greyscale()
    .blur(14)
    .raw()
    .toBuffer()

  const depth = Buffer.alloc(info.width * info.height)
  for (let i = 0; i < depth.length; i++) {
    const r = data[i * 3] / 255
    const b = data[i * 3 + 2] / 255
    const y = Math.floor(i / info.width) / info.height
    // Hue ratio rather than brightness, so dark dust lanes still count as dust.
    const warm = (r - b) / (r + b + 0.05)
    const dust = smoothstep(0.04, 0.35, warm) * smoothstep(0.015, 0.1, r)
    const structure = glow[i] / 255
    depth[i] = Math.round(255 * Math.min(1, dust * (0.36 + 0.42 * y + 0.42 * structure)))
  }
  // A strong blur merges small specks so each paper layer is a broad sheet.
  await sharp(depth, { raw: { width: info.width, height: info.height, channels: 1 } })
    .blur(12)
    .toColourspace("b-w")
    .png()
    .toFile(path.join(outDir, "nebula-carina-depth.png"))
  console.log("nebula: blur and depth maps")
}
