# Cistercian Glyph

A small web app that converts decimal numbers into [Cistercian numerals](https://en.wikipedia.org/wiki/Cistercian_numerals) and renders them as clean SVG geometry. Enter a number, preview the glyph live, and copy or download it as a transparent PNG or SVG.

**Live:** https://ahmedali1902.github.io/cistercian-glyph/

![Cistercian numeral reference](glyph-reference.png)

## Features

- **Live preview** — type a number and see the glyph update instantly; stems expand leftward with a smooth width animation
- **Range 0–999,999,999,999** — up to 12 digits (3 stems × 4 digits each); extra digits can't be typed, and longer pastes or links keep their first 12 digits
- **Comma-formatted input** — digits display with thousands separators; raw value stays digit-only internally
- **Shareable links** — the number is kept in the URL hash (e.g. [`#2026`](https://ahmedali1902.github.io/cistercian-glyph/#2026)), so any glyph can be linked
- **Digit breakdown** — a fixed table of thousands / hundreds / tens / ones, one row per stem; hover a digit to highlight that exact mark in the glyph, or a column header to highlight that place in every stem
- **Share menu** — one Share button under the glyph: copy image (transparent PNG), copy link, download PNG or SVG; files are named with the theme they were made in (e.g. `cistercian-2026-dark.png`); the glyph is 320 px tall, width scales with stem count
- **Stable layout** — the page is top-anchored, the preview card has a fixed height and wide glyphs shrink inside it, so nothing jumps while typing on any screen size
- **Examples** — one-click "this year" and "random number" (1–3 stems, each stem count equally likely)
- **Error toasts** — copy and download failures stack at the bottom of the screen (2s auto-dismiss, progress bar, pause on hover, dismiss button)
- **Dark mode** — follows the OS setting until you pick a theme; themes cross-fade when switched, and the toggle's knob wobbles like a droplet as it slides; applied before first paint, so there's no flash
- **Stem-centric geometry** — digits built from reflected segments on a 2×3 grid per stem (see [docs/glyph-system.md](docs/glyph-system.md))

## Quick start

Requires [Node.js](https://nodejs.org/) (LTS recommended).

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start dev server                    |
| `npm run build`        | Type-check and build for production |
| `npm run preview`      | Serve the production build locally  |
| `npm test`             | Run unit tests (Vitest)             |
| `npm run lint`         | Run ESLint                          |
| `npm run format`       | Format with Prettier                |
| `npm run format:check` | Check formatting without writing    |

## How it works

Each **stem** encodes up to four digits in one symbol. A vertical **staff** runs through the center; digit marks attach in four quadrants:

| Quadrant    | Place value (within a stem) |
| ----------- | --------------------------- |
| Upper-left  | Tens                        |
| Upper-right | Ones                        |
| Lower-left  | Thousands                   |
| Lower-right | Hundreds                    |

For `1234`: `1` thousands, `2` hundreds, `3` tens, `4` ones. Zero digits leave that quadrant empty.

Longer numbers are split into 4-digit groups from the right. Each group gets its own stem, and a short leftmost group is drawn at its true value (so `12,3456` shows `12`, not `1200`), which keeps every glyph unique; stems are laid out leftward with a fixed gap between them. The rightmost stem is anchored; additional stems extend to the left.

The glyph body per stem is **2:3** (two units wide, three tall) on a **2×3 grid of square cells**. The SVG viewBox is tight to the content (with a small inset for stroke clearance). Outer breathing room is applied separately in the preview layout and PNG export — not inside the viewBox.

Coordinate math, multi-stem layout, segment vocabulary, and reflection rules: [docs/glyph-system.md](docs/glyph-system.md).

## Project structure

Flat layout for a single-screen app — UI in `components/`, state in `hooks/`, rendering logic in `glyph/`.

```
cistercian-glyph/
├── docs/
│   └── glyph-system.md
├── glyph-reference.png
├── public/                    # favicon.svg, og.png (social preview)
├── src/
│   ├── assets/icons/          # share, image, link, download, check, dismiss, sun, moon (.svg)
│   ├── components/
│   │   ├── CistercianGlyph.tsx
│   │   ├── ErrorToasts.tsx    # provider + toast UI
│   │   ├── ExamplePicker.tsx  # "this year" / "random number"
│   │   ├── GlyphBreakdown.tsx # digit table + hover highlighting
│   │   ├── GlyphPreview.tsx   # responsive preview shell
│   │   ├── Header.tsx         # title + theme toggle
│   │   ├── Icon.tsx           # renders SVG assets (?raw) with currentColor
│   │   ├── NumberInput.tsx    # comma-formatted digit input (12-digit cap)
│   │   └── ShareMenu.tsx      # copy image / link, download PNG / SVG
│   ├── glyph/
│   │   ├── cistercian.ts      # path generation, input validation
│   │   ├── cistercian.test.ts
│   │   ├── highlight.ts       # breakdown → glyph highlight model
│   │   ├── random.ts          # random example numbers
│   │   ├── random.test.ts
│   │   └── glyphGeometry.ts   # grid, multi-stem layout, viewBox helpers
│   ├── hooks/
│   │   ├── useDarkMode.ts
│   │   ├── useGlyphExport.ts  # copy image / link + downloads
│   │   └── useGlyphInput.ts   # input state, URL hash sync
│   ├── utils/
│   │   └── glyphExport.ts     # export SVG, PNG rendering, downloads
│   ├── errorToast.ts          # context + useErrorToast
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
└── index.html
```

## Tech stack

- [React 19](https://react.dev/) with the React Compiler
- [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)

## Deployment

Every push to `main` runs lint, format check, tests and build in GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), then publishes `dist/` to GitHub Pages. The Vite `base` is `/cistercian-glyph/` to match the Pages URL.
