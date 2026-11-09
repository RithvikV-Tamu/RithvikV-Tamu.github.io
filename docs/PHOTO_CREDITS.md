# Photo credits

Photos come from official U.S. Air Force imagery (via Wikimedia Commons), the NASA Image and Video Library (https://images.nasa.gov) and the ESO image archive (https://www.eso.org/public/images/).

- U.S. Air Force photos are works of the U.S. federal government and are in the public domain. They may not be used to imply endorsement, so the site says "Not affiliated with the U.S. Air Force" next to those credits.
- NASA photos are generally not copyrighted and may be used with credit, as long as the use does not imply NASA endorsement. The site says "Not affiliated with NASA" next to NASA credits.
- ESO images are licensed CC BY 4.0. The credit must be clear, visible and unaltered: "ESO/F. Kamphues".

The project photos are representative images, not photos of Rithvik's own hardware or results. Every panel caption says so.

| File prefix | Source | Where it is used | Subject | Original | Download |
| --- | --- | --- | --- | --- | --- |
| `jet-twilight` | U.S. Air Force photo 190728-F-VA182-1014, by 2nd Lt. Samuel Eckholm | Hero (WebGL texture) | F-22 Raptor flying at twilight against storm clouds | 7212 x 4808 | https://upload.wikimedia.org/wikipedia/commons/8/8e/F-22_Raptor_flying_at_twilight_190728-F-VA182-1014.jpg |
| `jet-headon` | U.S. Air Force photo by Tech. Sgt. Emerson Nunez | Contact | Two F-22 Raptors flying head-on off Oahu, Hawaii, April 2025 | 5052 x 3368 | https://upload.wikimedia.org/wikipedia/commons/b/bb/USAF_General_Kevin_Schneider_pilots_F-22_Raptor_off_the_coast_of_Oahu%2C_Hawaii%2C_April_2025.jpg |
| `tacl-lasers` | ESO eso1613a | TACL panel | Four laser guide star beams from the VLT, Paranal. Credit: ESO/F. Kamphues | 5481 x 3648 | https://cdn.eso.org/images/large/eso1613a.jpg |
| `spirit-misse` | NASA iss058e003972 | TAMU-SPIRIT 2 panel | MISSE-FF materials exposure platform on the ISS exterior, 2019 | 4928 x 2768 | https://images-assets.nasa.gov/image/iss058e003972/iss058e003972~orig.jpg |
| `blue-skies-hurricane` | NASA iss063e074380 | Blue Skies panel | Hurricane Genevieve seen from the ISS, 2020 | 5568 x 3712 | https://images-assets.nasa.gov/image/iss063e074380/iss063e074380~orig.jpg |
| `aircraft-sailplane` | NASA EC91-504-1 | Aircraft panel | NASA PIK-20E sailplane in flight, 1991 | 5100 x 4000 | https://images-assets.nasa.gov/image/EC91-504-1/EC91-504-1~orig.jpg |

The Blue Skies inset render (`src/assets/projects/blue-skies-roll-cage.webp`) comes from the team's own 2024 proposal.

## Regenerating the web files

1. Download the originals above into `.local/originals/`, named `<file prefix>.jpg` (for example `jet-twilight.jpg`). That folder is git-ignored. Wikimedia asks for a descriptive User-Agent and rate-limits fast requests.
2. From the repo root, run `node scripts/prepare-photos.mjs`.
3. It writes AVIF and WebP files at 1600, 2560 and 3840 px wide to `public/media/photos/`, plus `jet-twilight-blur.webp` for the hero shader's depth of field. Use `--only=<prefix>` to redo one photo or `--maps` to redo only the blurred map.

Earlier heroes are in git history: the Artemis I launch pad, Webb's Carina "Cosmic Cliffs" and Hubble's Veil Nebula.
