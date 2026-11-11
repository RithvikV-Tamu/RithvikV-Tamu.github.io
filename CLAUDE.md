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

Aviation "flight profile": the theme is fighter jets, not space. A side altitude gauge reads in feet (0 to 50,000 ft) and shows the stage names (Takeoff, Climb, Cruise, Crew, Instruments, Logbook, Radio). Section headings stand alone: no eyebrow or kicker labels and no 01/02 numbers above them. Sections in order of importance: hero, featured work, quick stats, more work, about, toolkit, timeline, contact. Ctrl+K command palette to jump to projects. Respect `prefers-reduced-motion` and keep everything usable without animation.

Visual style: hyper-realistic 4K+ photography, not 3D renders. I rejected a procedural Three.js rocket (kept on local branch `experiment/3d-rocket-hero`) and a pinned scroll launch sequence (too slow to reach the projects). Keep the path to the projects short.

- Hero: one screen. Plain-WebGL shader (`src/components/hero/hero-canvas.tsx`, no Three.js) over an official USAF photo of an F-22 silhouetted against twilight storm clouds (I picked it from a sheet of candidates). Depth of field focuses on the jet (sharp at `JET`, blending toward `jet-twilight-blur.webp` with distance). My name is set in Saira Stencil One (I picked it from a sheet of 20 fonts; Michroma before that), flat and horizontal (never tilted), in the sky above the jet, as a dark backlit silhouette with a warm rim of light so it reads against the bright clouds. Interaction: the sun follows the cursor (or a tap on phones) and casts god rays through gaps in the clouds and past the letters, so the name's rim light shifts with it; it drifts slowly when idle. A hint line explains it and fades after the first move. The black hole was removed. Earlier space heroes (Artemis pad, Carina, Veil) are in git history; keep it clean and readable. A static photo with a CSS name shows first and is the fallback without WebGL. A facts strip runs along the bottom; scrolling fades straight into the featured work. No pinned sections.
- Featured projects: full-width photo panels with parallax, text on a shaded side, and a caption saying the photo is representative and who to credit. Each has a "Click around" card in `src/components/demos/`: TACL beam-through-turbulence illustration (labeled as not a physical model and not RIPTIDE output), SPIRIT CONOPS stepper, an A-7A Corsair II modes demo (`a7a-modes.tsx`: elevator, aileron or rudder impulse response by RK4, eigenvalues from the characteristic polynomial and Durand-Kerner in `src/lib/state-space.ts`, matrices copied from my AERO 321 report in `src/lib/a7a-model.ts`, and a what-if slider on Mq or r_r), and a NACA airfoil explorer using thin airfoil theory (`src/lib/naca.ts`). Demos must stay honest: real math where shown, clear labels where illustrative.
- More Work is a ruled list (name and stack, description, code link or "Private"), not a card grid. Timeline is a compact logbook list with the date in mono. The Aceternity timeline and Magic UI bento grid were removed.
- Type roles: Geist for text and labels, Geist Mono only for data (stats, altitude, dates, demo readouts), Saira Stencil One only for the hero name. Labels are small uppercase Geist, not mono.
- Contact: official USAF photo of two F-22s flying head-on. Cards for both emails (school `rithvik_v@tamu.edu`, personal `vootukur.r@gmail.com`, each with a copy button), LinkedIn, GitHub, and the CV PDF.
- CV only (I removed the aerospace resume from the site): `public/resume/Rithvik_Vootukur_Curriculum_Vitae.pdf`, copied from `C:\Projects\Resumes` (copy again when it changes). Linked from the top bar (CV), the contact section and the Ctrl+K menu. It includes my phone number.
- Credits and sources: `docs/PHOTO_CREDITS.md`. Keep the photographer credit and "Not affiliated with the U.S. Air Force" next to USAF photos, "Not affiliated with the U.S. Navy" next to U.S. Navy photos, "Not affiliated with NASA" next to NASA credits, and the full "ESO/F. Kamphues (CC BY 4.0)" credit on the TACL photo. Downloads under 1 GB from trusted sources are fine without asking; report what was downloaded.
- When editing files from PowerShell, don't use `Get-Content`/`Set-Content` on files with non-ASCII text (Windows PowerShell 5.1 garbles UTF-8 and adds a BOM). Use the editor tools or Node instead.

## This repo is public

Everything committed here is visible to anyone. Never commit private research data, unapproved TACL details, team documents, notes, drafts or secrets. Keep private working material in the legacy folder `C:\Projects\Portfolio Website` (private repo), not here.

## Reusable material from the legacy site (`C:\Projects\Portfolio Website`)

- `docs/PORTFOLIO_CONTENT_TEMPLATE.md`: my fill-in worksheet. Site text should come from my answers, not generated slogans.
- `public/resume/Rithvik_Vootukur_Master.pdf`: older approved resume. The site now uses the PDFs from `C:\Projects\Resumes` instead.
- `public/media/projects/gateways-vtol/`: Blue Skies report and figures (provenance in `docs/BLUE_SKIES_SOURCES.md`).
- `public/media/site/`: NASA Blue Marble Earth images. Keep the visible NASA credit (`docs/EARTH_IMAGERY.md`).

## Content rules

- Featured: TACL research, TAMU-SPIRIT 2, Blue Skies search-and-rescue UAV, A-7A stability and control (AERO 321, Spring 2026, approved for public), aircraft design. Candidates for "more work": RS-25 nozzle solver, orbital mechanics, structures/FEA, numerical heat transfer, bearing fault ML, Organization Bot, Personal Dashboard, ETF Research.
- TACL: RIPTIDE is proprietary. Only show real results Prof. Donzis has approved; otherwise use a clearly labeled generic illustration.
- Homework-based demos need a course-policy check before publishing.
- Dashboard and ETF Research handle private accounts. Show demo data only.
- Do not invent roles, numbers, results or awards. Separate my work from team work, proposals from achieved results, and simulations from physical tests.
- Do not claim TAMU-SPIRIT hardware has flown. Blue Skies was a completed proposal, not a built drone, and was not selected.
- If a section has no real content yet, leave it out.
