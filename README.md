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

## Adding a 21st.dev component

1. Find the component on https://21st.dev and copy its install command. It looks like `npx shadcn@latest add "https://21st.dev/r/<author>/<component>"`.
2. Run it in this folder. The source lands in `src/components/ui/`.
3. Replace Next.js-only imports if the component has them: `next/image` becomes a plain `<img>`, `next/link` becomes `<a>`, and a `"use client"` line can be deleted.
4. Check the component's license on its 21st.dev page.

## Layout

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | The page. Sections will be split into `src/components/sections/`. |
| `src/components/ui/` | shadcn and 21st.dev components. |
| `src/lib/utils.ts` | The `cn()` class-name helper used by shadcn components. |
| `src/index.css` | Tailwind setup and theme colors. |
| `public/` | Files served as-is (favicon, PDFs, images). |
| `components.json` | shadcn settings. |
