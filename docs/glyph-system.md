# Cistercian Glyph System — Design Specification

This document defines the geometric and compositional rules for rendering Cistercian numerals in this project. All coordinate math, SVG layout, and digit encoding should conform to these assumptions.

Implementation lives in `src/glyph/glyphGeometry.ts` (grid constants, multi-stem layout, viewBox) and `src/glyph/cistercian.ts` (digit paths, input grouping).

## Overall proportions

Each **stem** (one 4-digit glyph body) has a fixed aspect ratio of **2:3**, where **2 is width** and **3 is height** — two units wide, three units tall.

```
Single stem (2:3)                      Grid (2 cols × 3 rows)
┌─────────┐                            ┌────┬────┐
│ TL │ TR │  top row                   │ TL │ TR │
├────┼────┤                            ├────┼────┤
│    │    │  middle row (stem only)    │    │    │
├────┼────┤                            ├────┼────┤
│ BL │ BR │  bottom row                │ BL │ BR │
└─────────┘                            └────┴────┘
```

## Multi-stem layout

Numbers longer than four digits are split into **4-digit groups from the right**. Each group renders as its own stem. Stems are spaced by `STEM_GAP` and laid out **leftward** from a rightmost anchor stem.

| Constant           | Default                  | Meaning                      |
| ------------------ | ------------------------ | ---------------------------- |
| `MAX_STEM_COUNT`   | 3                        | Maximum stems (12 digits)    |
| `STEM_DIGIT_COUNT` | 4                        | Digits per stem              |
| `STEM_GAP`         | 18                       | Horizontal gap between stems |
| `STEM_STRIDE`      | `GLYPH_WIDTH + STEM_GAP` | Horizontal offset per stem   |

The rightmost stem uses `createStemGeometry(0)`. Each additional stem to the left uses `createStemGeometry(1)`, `createStemGeometry(2)`, etc., shifting all x-coordinates left by multiples of `STEM_STRIDE`.

A partial leftmost group (e.g. `5` in `5,1234`) is drawn at its **true value**, exactly as if it were left-padded with zeros (`5` → `0005`, a single mark in the ones quadrant). This keeps every number's glyph unique: scaling short groups up instead (`5` → 5000) would make `5,1234` and `5000,1234` look identical. `getGlyphStems` returns the groups left to right with their digits and path data.

## Grid: six square cells per stem

Each stem is laid out on a **2 columns × 3 rows** grid of square cells. Each cell is **1:1** (equal width and height).

| Row    | Left cell           | Right cell           |
| ------ | ------------------- | -------------------- |
| Top    | Upper-left quadrant | Upper-right quadrant |
| Middle | Middle-left cell    | Middle-right cell    |
| Bottom | Lower-left quadrant | Lower-right quadrant |

- **Top row** — encodes the **upper segment** (tens on the left, ones on the right).
- **Bottom row** — encodes the **lower segment** (thousands on the left, hundreds on the right).
- **Middle row** — continuation of the stem only; no digit marks. Separates upper and lower encoding regions.

## The stem

The design is **stem-centric**. A single **vertical staff** runs through the full height of each stem along the **center seam** between the left and right columns.

- The stem is the structural anchor: all digit marks attach to it or extend from it.
- It spans all three rows (top, middle, bottom).
- Digit segments in each quadrant originate at or meet the stem, then extend into that quadrant's cell.

## Quadrants and digits

Each non-zero digit (1–9) in a 4-digit stem value is drawn in one quadrant. Zero digits produce no marks in that quadrant.

| Quadrant    | Place value | Grid cell    |
| ----------- | ----------- | ------------ |
| Upper-left  | Tens        | Top-left     |
| Upper-right | Ones        | Top-right    |
| Lower-left  | Thousands   | Bottom-left  |
| Lower-right | Hundreds    | Bottom-right |

A four-digit value maps as `ABCD` → thousands `A`, hundreds `B`, tens `C`, ones `D`.

## Segment vocabulary

Digits are built from a **small reusable set of segment types**, not unique shapes per digit. The same segment primitives appear in every quadrant; only their **position and orientation** change.

| Segment type   | Description                                    |
| -------------- | ---------------------------------------------- |
| **Horizontal** | Straight line parallel to the top/bottom edges |
| **Diagonal**   | Straight line at an angle across the quadrant  |
| **Vertical**   | Straight line parallel to the stem             |

The **ones quadrant** (upper-right) defines the canonical digit shapes. The other three quadrants reuse those same paths, reflected horizontally and/or vertically across the stem so that geometry stays consistent.

## Coordinate model

Internal glyph coordinates start at the origin (`GLYPH_LEFT = 0`, `GLYPH_TOP = 0`). Constants in `src/glyph/glyphGeometry.ts`:

| Constant              | Value | Meaning                                   |
| --------------------- | ----- | ----------------------------------------- |
| `CELL_SIZE`           | 30    | Side of each 1:1 grid cell                |
| `GLYPH_WIDTH`         | 60    | `2 × CELL_SIZE`                           |
| `GLYPH_HEIGHT`        | 90    | `3 × CELL_SIZE`                           |
| `STEM_X`              | 30    | Stem on the column seam                   |
| `OUTER_X`             | 60    | Outer edge of right column                |
| `TOP_Y`               | 0     | Top of glyph / upper row                  |
| `UPPER_ROW_BOTTOM_Y`  | 30    | Bottom of upper row (= top of middle row) |
| `LOWER_ROW_TOP_Y`     | 60    | Top of lower row (= bottom of middle row) |
| `BOTTOM_Y`            | 90    | Bottom of glyph / lower row               |
| `QUADRANT_REFLECT_Y`  | 45    | Horizontal mirror axis for upper ↔ lower  |
| `GLYPH_STROKE_WIDTH`  | 4     | SVG stroke width                          |
| `VIEWBOX_INSET`       | 3     | Stroke clearance inside the viewBox       |
| `GLYPH_FRAME_PADDING` | 18    | Outer padding (preview CSS + PNG canvas)  |

### ViewBox

The SVG viewBox is **tight to content**, not a fixed square. For `stemCount` stems:

- Content width: `GLYPH_WIDTH + (stemCount - 1) × STEM_STRIDE`
- Content min-x: `-(stemCount - 1) × STEM_STRIDE` (leftward expansion)
- ViewBox adds `VIEWBOX_INSET` on all sides for stroke clearance

Single-stem viewBox example: `-3 -3 66 96` (via `SVG_VIEWBOX`).

**Frame padding** (`GLYPH_FRAME_PADDING`) is applied **outside** the viewBox — in the preview container (`GlyphPreview`) and in exports (`glyphExport.ts`). On screen the preview is 12rem tall and shrinks proportionally when a wide multi-stem glyph would exceed the available width.

Digit paths are authored in the **ones** template using anchor points on the stem (`STEM_X`), the outer edge (`OUTER_X`), and the upper-row top/bottom (`TOP_Y`, `UPPER_ROW_BOTTOM_Y`). Other quadrants mirror via `QUADRANT_TRANSFORMS` in `src/glyph/cistercian.ts`. Multi-stem stems translate x-coordinates via `createStemGeometry`.

## Export

Copy (PNG) and download (PNG or SVG) share one export SVG built by `buildExportSvg`:

- Content height: **320 px** (`SVG_SIZE`); width scales with viewBox aspect ratio
- Frame padding: `GLYPH_FRAME_PADDING` baked into the export viewBox, proportional to content height
- Stroke color: the current theme colour, converted to hex so any SVG consumer can read it
- PNG: the export SVG rasterized onto a transparent canvas at its pixel size

## Summary

| Rule                       | Value / behavior                           |
| -------------------------- | ------------------------------------------ |
| Glyph aspect ratio (stem)  | **2:3** — **2 = width**, **3 = height**    |
| Grid                       | **2 columns × 3 rows** of **1:1** squares  |
| Structural center          | **Vertical stem** on the column seam       |
| Upper encoding             | **Top two cells** (tens, ones)             |
| Lower encoding             | **Bottom two cells** (thousands, hundreds) |
| Middle row                 | Stem only; separates upper / lower         |
| Multi-stem                 | 4-digit groups from the right, expand left |
| Partial leftmost group     | Drawn at its true value (`5` → `0005`)     |
| Max range                  | 3 stems × 4 digits = **12 digits**         |
| SVG viewBox                | Tight to content + `VIEWBOX_INSET`         |
| Outer padding              | `GLYPH_FRAME_PADDING` in layout/export     |
| Exported PNG / SVG         | 320 px glyph + padding; width scales       |
| Digit construction         | Horizontal, diagonal, vertical segments    |
| Cross-quadrant consistency | Same segments, reflected orientations      |
