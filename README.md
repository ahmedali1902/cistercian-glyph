# Cistercian Glyph

A small web app that converts decimal numbers into [Cistercian numerals](https://en.wikipedia.org/wiki/Cistercian_numerals) and renders them as clean SVG geometry. Enter a number, preview the glyph live, and copy it to the clipboard as a transparent PNG.

![Cistercian numeral reference](glyph-reference.png)

## Features

- **Live preview** — type a number and see the glyph update instantly; stems expand leftward with a smooth width animation
- **Range 0–999,999,999,999,999,999,999,999** — up to 24 digits (6 stems × 4 digits each)
- **Comma-formatted input** — digits display with thousands separators; raw value stays digit-only internally
- **Copy as PNG** — overlay button exports a transparent PNG with theme-aware stroke color; height is 320 px, width scales with stem count
- **Error toasts** — validation and copy failures stack in the bottom-right (2s auto-dismiss, top progress bar, pause on hover, dismiss button)
- **Dark mode** — sun/moon toggle; preference stored in `localStorage` and applied before first paint
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

Longer numbers are split into 4-digit groups from the right. Each group gets its own stem; stems are laid out leftward with a fixed gap between them. The rightmost stem is anchored; additional stems extend to the left.

The glyph body per stem is **2:3** (two units wide, three tall) on a **2×3 grid of square cells**. The SVG viewBox is tight to the content (with a small inset for stroke clearance). Outer breathing room is applied separately in the preview layout and PNG export — not inside the viewBox.

Coordinate math, multi-stem layout, segment vocabulary, and reflection rules: [docs/glyph-system.md](docs/glyph-system.md).

## Project structure

Flat layout for a single-screen app — UI in `components/`, state in `hooks/`, rendering logic in `glyph/`.

```
cistercian-glyph/
├── docs/
│   └── glyph-system.md
├── glyph-reference.png
├── src/
│   ├── assets/icons/          # copy, check, dismiss, sun, moon (.svg)
│   ├── components/
│   │   ├── CistercianGlyph.tsx
│   │   ├── ErrorToasts.tsx    # provider + toast UI
│   │   ├── GlyphPreview.tsx   # preview shell + copy overlay
│   │   ├── Header.tsx         # title + theme toggle
│   │   ├── Icon.tsx           # renders SVG assets (?raw) with currentColor
│   │   └── NumberInput.tsx    # comma-formatted digit input
│   ├── glyph/
│   │   ├── cistercian.ts      # path generation, input validation
│   │   └── glyphGeometry.ts   # grid, multi-stem layout, viewBox helpers
│   ├── hooks/
│   │   ├── useCopyGlyph.ts
│   │   ├── useDarkMode.ts
│   │   └── useGlyphInput.ts
│   ├── utils/
│   │   └── svgToPng.ts        # SVG → transparent PNG blob
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
