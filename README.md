# Rithvik Vootukur portfolio

Personal portfolio site built with [Astro](https://docs.astro.build) and hosted on GitHub Pages at https://rithvikv-tamu.github.io.

## Run locally

In PowerShell, from this folder:

```powershell
npm ci
npm run dev
```

Then open http://localhost:4321.

## Publish a change

Push to `main`. The workflow in `.github/workflows/deploy.yml` builds the site and deploys it to GitHub Pages. Progress shows in the repository's **Actions** tab.

To check the production build locally first:

```powershell
npm run build
npm run preview
```

## Layout

| Path | Purpose |
| --- | --- |
| `src/pages/` | One file per page. `index.astro` is the homepage. |
| `src/layouts/BaseLayout.astro` | Shared page shell and global styles. |
| `public/` | Files served as-is (images, PDFs, favicon). |
