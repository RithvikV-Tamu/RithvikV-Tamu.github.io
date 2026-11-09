# Portfolio site (GitHub Pages)

One-page interactive portfolio. Public repo `rithvikvootukur/rithvikvootukur.github.io` (owned by my free GitHub organization `rithvikvootukur`; my personal account is `RithvikV-Tamu`), served at https://rithvikvootukur.github.io. The local folder is still named `C:\Projects\RithvikV-Tamu.github.io`. Pushing to `main` lints, builds and deploys through `.github/workflows/deploy.yml`.

## Stack

- Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix base, Nova preset). Run commands are in `README.md`.
- UI components come mainly from 21st.dev. Its installs need a personal API key, so prefer the same components from the Aceternity UI (`https://ui.aceternity.com/registry/<name>.json`) and Magic UI (`https://magicui.design/r/<name>.json`) registries, which need no key. Components land in `src/components/ui/`. Replace Next.js-only imports (`next/image`, `next/link`, `"use client"`), drop heavy extras like Three.js, and check each license.
- All page text and links live in `src/content/site.ts`. Sections are in `src/components/sections/`.
- Build physics demos (beam, airfoil, nozzle, orbits) myself in plain TypeScript so they are accurate. Use 21st.dev for layout and motion.
- `@/` maps to `src/`. The site is always dark (`class="dark"` on `<html>`).
- Must stay a static build. No server code, no secrets in client code.

## Page concept

"Mission profile" scroll from launch to orbit with a side altitude gauge. Sections in order of importance: hero, featured work, quick stats, more work, about, toolkit, timeline, contact. Ctrl+K command palette to jump to projects. Respect `prefers-reduced-motion` and keep everything usable without animation.

Visual style: hyper-realistic 4K+ photography, not 3D renders. I rejected a procedural Three.js rocket (kept on local branch `experiment/3d-rocket-hero`) and a pinned scroll launch sequence (too slow to reach the projects). Keep the path to the projects short.

- Hero: one screen. NASA photo of Artemis I on the pad at night; my name sits between the photo and a cutout of the lit rocket, with cursor parallax. A facts strip runs along the bottom. Scrolling slides the photo slower than the page and fades straight into the featured work. No pinned sections.
- Featured projects: full-width photo panels with parallax, text on a shaded side, and a caption saying the photo is representative and who to credit. Each has a "Try it" card in `src/components/demos/`: TACL beam-through-turbulence illustration (labeled as not a physical model and not RIPTIDE output), SPIRIT CONOPS stepper, and a NACA airfoil explorer using thin airfoil theory (`src/lib/naca.ts`). Demos must stay honest: real math where shown, clear labels where illustrative.
- Contact: orbital sunrise photo.
- Credits and sources: `docs/PHOTO_CREDITS.md`. Keep "Not affiliated with NASA" next to NASA credits and the full "ESO/F. Kamphues (CC BY 4.0)" credit on the TACL photo. Ask before downloading new images.
- When editing files from PowerShell, don't use `Get-Content`/`Set-Content` on files with non-ASCII text (Windows PowerShell 5.1 garbles UTF-8 and adds a BOM). Use the editor tools or Node instead.

## This repo is public

Everything committed here is visible to anyone. Never commit private research data, unapproved TACL details, team documents, notes, drafts or secrets. Keep private working material in the legacy folder `C:\Projects\Portfolio Website` (private repo), not here.

## Reusable material from the legacy site (`C:\Projects\Portfolio Website`)

- `docs/PORTFOLIO_CONTENT_TEMPLATE.md`: my fill-in worksheet. Site text should come from my answers, not generated slogans.
- `public/resume/Rithvik_Vootukur_Master.pdf`: approved resume. Ask before publishing it here, because it contains contact details.
- `public/media/projects/gateways-vtol/`: Blue Skies report and figures (provenance in `docs/BLUE_SKIES_SOURCES.md`).
- `public/media/site/`: NASA Blue Marble Earth images. Keep the visible NASA credit (`docs/EARTH_IMAGERY.md`).

## Content rules

- Featured: TACL research, TAMU-SPIRIT 2, Blue Skies search-and-rescue UAV, aircraft design. Candidates for "more work": RS-25 nozzle solver, orbital mechanics, structures/FEA, numerical heat transfer, bearing fault ML, Organization Bot, Personal Dashboard, ETF Research.
- TACL: RIPTIDE is proprietary. Only show real results Prof. Donzis has approved; otherwise use a clearly labeled generic illustration.
- Homework-based demos need a course-policy check before publishing.
- Dashboard and ETF Research handle private accounts. Show demo data only.
- Do not invent roles, numbers, results or awards. Separate my work from team work, proposals from achieved results, and simulations from physical tests.
- Do not claim TAMU-SPIRIT hardware has flown. Blue Skies was a completed proposal, not a built drone, and was not selected.
- If a section has no real content yet, leave it out.
