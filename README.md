# Rithvik Vootukur portfolio

One-page interactive portfolio built with Vite, React, TypeScript, Tailwind CSS and shadcn/ui, hosted on GitHub Pages at https://rithvikv-tamu.github.io.

## Run locally

In PowerShell, from this folder:

```powershell
npm ci
npm run dev
```

Then open http://localhost:5173.

## Publish a change

Push to `main`. The workflow in `.github/workflows/deploy.yml` lints, builds and deploys the site. Progress shows in the repository's **Actions** tab.

To check the production build locally first:

```powershell
npm run build
npm run preview
```

## Editing the page

All text and links are in `src/content/site.ts`. Each section is a file in `src/components/sections/`. A blank field (`""`) hides that item.

## Adding a 21st.dev component

21st.dev installs need a personal API key (free accounts have a daily limit). Many of its components are mirrors of Aceternity UI and Magic UI, which install without a key:

```powershell
npx shadcn@latest add "https://ui.aceternity.com/registry/<name>.json"
npx shadcn@latest add "https://magicui.design/r/<name>.json"
```

For a 21st.dev-only component, set your key in your own terminal first (`$env:API_KEY_21ST = "..."`, never commit it) and run the install command from its page.

After installing:

1. The source lands in `src/components/ui/`.
2. Replace Next.js-only imports if the component has them: `next/image` becomes a plain `<img>`, `next/link` becomes `<a>`, and a `"use client"` line can be deleted.
3. Check the component's license.
4. Watch for heavy extras (some pull in Three.js). Remove anything the page does not need.

Adapted components in this repo: Timeline (Aceternity UI, MIT) and Bento Grid (Magic UI, MIT).

## Photos

The hero, project panels and contact section use NASA and ESO photos. Credits, licenses, sources and how to regenerate the web files are in `docs/PHOTO_CREDITS.md`. Originals live in the git-ignored `.local/originals/`. Web versions are made with:

```powershell
node scripts/prepare-photos.mjs
```

## Layout

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | The page: puts the sections in order. |
| `src/content/site.ts` | All page text, links, project data and photo captions. |
| `src/components/sections/` | One file per page section. |
| `src/components/photo.tsx` | Responsive AVIF/WebP photo from `public/media/photos/`. |
| `scripts/prepare-photos.mjs` | Makes the web photo files and the rocket cutout. |
| `src/components/ui/` | shadcn and 21st.dev components. |
| `src/lib/utils.ts` | The `cn()` class-name helper used by shadcn components. |
| `src/index.css` | Tailwind setup and theme colors. |
| `public/` | Files served as-is (favicon, PDFs, images). |
| `components.json` | shadcn settings. |
