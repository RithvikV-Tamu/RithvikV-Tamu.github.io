# Photo credits

Photos come from the NASA Image and Video Library (https://images.nasa.gov) and the ESO image archive (https://www.eso.org/public/images/).

- NASA photos are generally not copyrighted and may be used with credit, as long as the use does not imply NASA endorsement. The site says "Not affiliated with NASA" next to NASA credits.
- ESO images are licensed CC BY 4.0. The credit must be clear, visible and unaltered: "ESO/F. Kamphues".

The project photos are representative images, not photos of Rithvik's own hardware or results. Every panel caption says so.

| File prefix | Source ID | Where it is used | Subject | Original | Download |
| --- | --- | --- | --- | --- | --- |
| `pad-night` | NASA KSC-20221104-PH-ILW01_0298 | Hero | Artemis I on Launch Complex 39B at night | 6720 x 4480 | https://images-assets.nasa.gov/image/KSC-20221104-PH-ILW01_0298/KSC-20221104-PH-ILW01_0298~orig.jpg |
| `orbit-sunrise` | NASA iss073e1068530 | Contact | Orbital sunrise over Earth's horizon, ISS Expedition 73 | 4928 x 2768 | https://images-assets.nasa.gov/image/iss073e1068530/iss073e1068530~orig.jpg |
| `tacl-lasers` | ESO eso1613a | TACL panel | Four laser guide star beams from the VLT, Paranal. Credit: ESO/F. Kamphues | 5481 x 3648 | https://cdn.eso.org/images/large/eso1613a.jpg |
| `spirit-misse` | NASA iss058e003972 | TAMU-SPIRIT 2 panel | MISSE-FF materials exposure platform on the ISS exterior, 2019 | 4928 x 2768 | https://images-assets.nasa.gov/image/iss058e003972/iss058e003972~orig.jpg |
| `blue-skies-hurricane` | NASA iss063e074380 | Blue Skies panel | Hurricane Genevieve seen from the ISS, 2020 | 5568 x 3712 | https://images-assets.nasa.gov/image/iss063e074380/iss063e074380~orig.jpg |
| `aircraft-sailplane` | NASA EC91-504-1 | Aircraft panel | NASA PIK-20E sailplane in flight, 1991 | 5100 x 4000 | https://images-assets.nasa.gov/image/EC91-504-1/EC91-504-1~orig.jpg |

The Blue Skies inset render (`src/assets/projects/blue-skies-roll-cage.webp`) comes from the team's own 2024 proposal.

## Regenerating the web files

1. Download the originals above into `.local/originals/`, named `<file prefix>.jpg` (for example `tacl-lasers.jpg`). That folder is git-ignored.
2. From the repo root, run `node scripts/prepare-photos.mjs`.
3. It writes AVIF and WebP files at 1600, 2560 and 3840 px wide to `public/media/photos/`, plus `pad-night-cutout-*.webp`, the rocket and towers on a transparent background.

The cutout combines a hand-traced outline of the rocket stack with a brightness and warmth mask for the lit service tower, lightning towers and pad lights. If you swap the pad photo, the outline in `scripts/prepare-photos.mjs` has to be traced again.
