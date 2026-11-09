# Photo credits

All hero photos are NASA imagery from the NASA Image and Video Library (https://images.nasa.gov). NASA photos are generally not copyrighted and may be used with credit, as long as the use does not imply NASA endorsement. The site shows "Photos: NASA ... Not affiliated with NASA." on the hero.

| File prefix | NASA ID | Subject | Original size | Original download |
| --- | --- | --- | --- | --- |
| `pad-night` | KSC-20221104-PH-ILW01_0298 | Artemis I SLS and Orion on Launch Complex 39B at night | 6720 x 4480 | https://images-assets.nasa.gov/image/KSC-20221104-PH-ILW01_0298/KSC-20221104-PH-ILW01_0298~orig.jpg |
| `liftoff` | NHQ202211160006 | Artemis I liftoff, Nov 16, 2022 | 4933 x 3332 | https://images-assets.nasa.gov/image/NHQ202211160006/NHQ202211160006~orig.jpg |
| `ascent` | NHQ202211160007 | Artemis I ascent above the steam cloud | 4032 x 3958 | https://images-assets.nasa.gov/image/NHQ202211160007/NHQ202211160007~orig.jpg |
| `orbit-sunrise` | iss073e1068530 | Orbital sunrise over Earth's horizon, ISS Expedition 73 | 4928 x 2768 | https://images-assets.nasa.gov/image/iss073e1068530/iss073e1068530~orig.jpg |

## Regenerating the web files

1. Download the originals above into `.local/originals/` with these names: `pad-night.jpg`, `liftoff.jpg`, `ascent.jpg`, `orbit-sunrise.jpg`. That folder is git-ignored.
2. From the repo root, run `node scripts/prepare-photos.mjs`.
3. It writes AVIF and WebP files at 1600, 2560 and 3840 px wide to `public/media/hero/`, plus `pad-night-cutout-*.webp`, the rocket and towers on a transparent background.

The cutout combines a hand-traced outline of the rocket stack with a brightness and warmth mask for the lit service tower, lightning towers and pad lights. If you swap the pad photo, the outline in `scripts/prepare-photos.mjs` has to be traced again.
