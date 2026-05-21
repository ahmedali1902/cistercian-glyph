# Cistercian Glyph

A small web app that converts decimal numbers into [Cistercian numerals](https://en.wikipedia.org/wiki/Cistercian_numerals) and renders them as clean SVG geometry. Enter a number, preview the glyph live, and copy it to the clipboard as a transparent PNG.

![Cistercian numeral reference](glyph-reference.png)

## Features

- **Live preview** — type a number and see the glyph update instantly
- **Range 0–9999** — four-digit Cistercian encoding (thousands, hundreds, tens, ones)
- **Copy as PNG** — export a 320×320 transparent square image to the clipboard
- **Dark mode** — toggle light/dark theme with persisted preference
- **Stem-centric geometry** — digits built from reflected horizontal, diagonal, and vertical segments on a 2×3 grid

## Quick start

Requires [Node.js](https://nodejs.org/) (LTS recommended).

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting without writing |

## How it works

Cistercian numerals encode up to four digits in a single compact symbol. A vertical **stem** runs through the center; digit marks attach to it in four quadrants:

| Quadrant | Place value |
|----------|-------------|
| Upper-left | Tens |
| Upper-right | Ones |
| Lower-left | Thousands |
| Lower-right | Hundreds |

A value like `1234` maps as `1` (thousands), `2` (hundreds), `3` (tens), `4` (ones). Zero digits produce no marks in that quadrant.

The glyph body uses a **2:3 aspect ratio** (two units wide, three tall) on a **2×3 grid of square cells**. The preview and exported PNG use a **1:1 square canvas** with the glyph centered inside — never stretched.

For the full geometric specification (coordinates, segment vocabulary, reflection rules), see [docs/glyph-system.md](docs/glyph-system.md).

## Project structure

The layout follows standard Vite + React conventions: UI in `components/`, React state in `hooks/`, small pure helpers in `utils/`, and glyph rendering in `glyph/`.

```
cistercian-glyph/
├── docs/
│   └── glyph-system.md       # Geometric design spec
├── glyph-reference.png       # Digit reference image
├── src/
│   ├── glyph/                # Glyph engine (geometry, paths, constants)
│   │   ├── cistercian.ts     # Digit paths, quadrant transforms, public API
│   │   ├── glyphGeometry.ts  # Grid layout and SVG anchor coordinates
│   │   └── constants.ts      # Max value, stroke width, PNG export size
│   ├── App.tsx               # App shell and layout
│   ├── main.tsx              # Entry point
│   ├── components/           # Presentational UI
│   │   ├── CistercianGlyph.tsx
│   │   ├── CopyGlyphButton.tsx
│   │   ├── GlyphPreview.tsx
│   │   ├── Header.tsx
│   │   ├── InvalidGlyph.tsx
│   │   ├── NumberInput.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/                # Input, theme, and clipboard behavior
│   └── utils/                # Input normalization, SVG → PNG export
└── index.html
```

## Tech stack

- [React 19](https://react.dev/) with the React Compiler
- [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
