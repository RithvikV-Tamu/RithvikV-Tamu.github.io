# Photo credits

Photos come from the NASA Image and Video Library (https://images.nasa.gov), the ESA/Hubble archive (https://esahubble.org/images/) and the ESO image archive (https://www.eso.org/public/images/).

- NASA photos are generally not copyrighted and may be used with credit, as long as the use does not imply NASA endorsement. The site says "Not affiliated with NASA" next to NASA credits.
- ESA/Hubble images are licensed CC BY 4.0. Credit: "NASA, ESA, Hubble Heritage Team".
- ESO images are licensed CC BY 4.0. The credit must be clear, visible and unaltered: "ESO/F. Kamphues".

The project photos are representative images, not photos of Rithvik's own hardware or results. Every panel caption says so.

| File prefix | Source ID | Where it is used | Subject | Original | Download |
| --- | --- | --- | --- | --- | --- |
| `nebula-veil` | ESA/Hubble heic1520a | Hero (WebGL texture) | "Revisiting the Veil Nebula", Hubble. Credit: NASA, ESA, Hubble Heritage Team | 10681 x 7121 | https://cdn.esahubble.org/archives/images/large/heic1520a.jpg |
| `orbit-sunrise` | NASA iss073e1068530 | Contact | Orbital sunrise over Earth's horizon, ISS Expedition 73 | 4928 x 2768 | https://images-assets.nasa.gov/image/iss073e1068530/iss073e1068530~orig.jpg |
| `tacl-lasers` | ESO eso1613a | TACL panel | Four laser guide star beams from the VLT, Paranal. Credit: ESO/F. Kamphues | 5481 x 3648 | https://cdn.eso.org/images/large/eso1613a.jpg |
| `spirit-misse` | NASA iss058e003972 | TAMU-SPIRIT 2 panel | MISSE-FF materials exposure platform on the ISS exterior, 2019 | 4928 x 2768 | https://images-assets.nasa.gov/image/iss058e003972/iss058e003972~orig.jpg |
| `blue-skies-hurricane` | NASA iss063e074380 | Blue Skies panel | Hurricane Genevieve seen from the ISS, 2020 | 5568 x 3712 | https://images-assets.nasa.gov/image/iss063e074380/iss063e074380~orig.jpg |
| `aircraft-sailplane` | NASA EC91-504-1 | Aircraft panel | NASA PIK-20E sailplane in flight, 1991 | 5100 x 4000 | https://images-assets.nasa.gov/image/EC91-504-1/EC91-504-1~orig.jpg |

The Blue Skies inset render (`src/assets/projects/blue-skies-roll-cage.webp`) comes from the team's own 2024 proposal.

## Regenerating the web files

1. Download the originals above into `.local/originals/`, named `<file prefix>.jpg` (for example `tacl-lasers.jpg`). That folder is git-ignored.
2. From the repo root, run `node scripts/prepare-photos.mjs`.
3. It writes AVIF and WebP files at 1600, 2560 and 3840 px wide to `public/media/photos/`, plus `nebula-veil-blur.webp` for the hero shader's depth of field. The full run is slow because the originals are huge; use `--only=<prefix>` to redo one photo or `--maps` to redo only the blurred map.

Earlier heroes are in git history: the Artemis I launch pad (with a hand-traced rocket cutout) and Webb's Carina "Cosmic Cliffs" nebula.
