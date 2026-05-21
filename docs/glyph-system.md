# Cistercian Glyph System — Design Specification

This document defines the geometric and compositional rules for rendering Cistercian numerals in this project. All coordinate math, SVG layout, and digit encoding should conform to these assumptions.

Implementation lives in `src/glyph/glyphGeometry.ts` (grid constants) and `src/glyph/cistercian.ts` (digit paths).

## Overall proportions

The **glyph body** has a fixed aspect ratio of **2:3**, where **2 is width** and **3 is height** — two units wide, three units tall. It is taller than it is wide.

The **SVG viewBox**, **on-screen preview**, and **copied PNG** all use a **1:1 square** coordinate space. The 2:3 glyph is **centered** inside that square with equal padding on the sides and less padding above/below (because the glyph is taller relative to its width than the square is). The glyph is never stretched to fill the square.

```
Square viewBox / PNG (1:1)             Glyph body (2:3, centered)
┌─────────────────────┐                ┌─────────┐
│                     │                │ TL │ TR │  top row
│    ┌─────────┐      │                ├────┼────┤
│    │ w:2 h:3 │      │       ≈        │    │    │  middle row (stem)
│    │  glyph  │      │                ├────┼────┤
│    └─────────┘      │                │ BL │ BR │  bottom row
│                     │                └─────────┘
└─────────────────────┘
```

## Grid: six square cells

The glyph is laid out on a **2 columns × 3 rows** grid of square cells. Each cell is **1:1** (equal width and height). That yields a frame **2 units wide × 3 units tall** — the **2:3** ratio (width : height).

| Row    | Left cell            | Right cell           |
|--------|----------------------|----------------------|
| Top    | Upper-left quadrant  | Upper-right quadrant |
| Middle | Middle-left cell     | Middle-right cell    |
| Bottom | Lower-left quadrant  | Lower-right quadrant |

- **Top row** — encodes the **upper segment** (tens on the left, ones on the right).
- **Bottom row** — encodes the **lower segment** (thousands on the left, hundreds on the right).
- **Middle row** — continuation of the stem only; no digit marks. Separates upper and lower encoding regions.

Every grid cell is a perfect square. If the side length of one cell is `u`, the glyph frame is `2u` wide and `3u` tall.

## The stem

The design is **stem-centric**. A single **vertical staff** runs through the full height of the glyph along the **center seam** between the left and right columns (the shared edge of the six cells).

- The stem is the structural anchor: all digit marks attach to it or extend from it.
- It spans all three rows (top, middle, bottom).
- Digit segments in each quadrant originate at or meet the stem, then extend into that quadrant’s cell.

## Quadrants and digits

Each non-zero digit (1–9) in a number is drawn in one quadrant. Zero digits produce no marks in that quadrant.

| Quadrant    | Place value | Grid cell   |
|-------------|-------------|-------------|
| Upper-left  | Tens        | Top-left    |
| Upper-right | Ones        | Top-right   |
| Lower-left  | Thousands   | Bottom-left |
| Lower-right | Hundreds    | Bottom-right|

A four-digit value maps as `ABCD` → thousands `A`, hundreds `B`, tens `C`, ones `D`.

## Segment vocabulary

Digits are built from a **small reusable set of segment types**, not unique shapes per digit. The same segment primitives appear in every quadrant; only their **position and orientation** change.

| Segment type   | Description                                    |
|----------------|------------------------------------------------|
| **Horizontal** | Straight line parallel to the top/bottom edges |
| **Diagonal**   | Straight line at an angle across the quadrant  |
| **Vertical**   | Straight line parallel to the stem             |

Each digit is one or more connected segments drawn from the stem toward the outer edges and corners of its quadrant cell. Segments meet at the stem or at outer anchor points (cell edges and corners).

The **ones quadrant** (upper-right) defines the canonical digit shapes. The other three quadrants reuse those same paths, reflected horizontally and/or vertically across the stem so that geometry stays consistent.

## Coordinate model

The SVG uses a **1:1 viewBox** (`0 0 100 100`). The glyph grid is mapped into it as follows (`src/glyph/glyphGeometry.ts`):

| Constant            | Value | Meaning                                      |
|---------------------|-------|----------------------------------------------|
| `VIEWBOX_SIZE`      | 100   | Square viewBox side length                   |
| `CELL_SIZE`         | 30    | Side of each 1:1 grid cell                   |
| `GLYPH_WIDTH`       | 60    | `2 × CELL_SIZE`                              |
| `GLYPH_HEIGHT`      | 90    | `3 × CELL_SIZE`                              |
| `GLYPH_LEFT`        | 20    | Left edge of glyph frame (centers 2:3 in 1:1) |
| `GLYPH_TOP`         | 5     | Top edge of glyph frame                      |
| `STEM_X`            | 50    | Stem on the column seam                      |
| `OUTER_X`           | 80    | Outer edge of right column                   |
| `TOP_Y`             | 5     | Top of glyph / upper row                     |
| `UPPER_ROW_BOTTOM_Y`| 35    | Bottom of upper row (= top of middle row)    |
| `LOWER_ROW_TOP_Y`   | 65    | Top of lower row (= bottom of middle row)    |
| `BOTTOM_Y`          | 95    | Bottom of glyph / lower row                  |
| `QUADRANT_REFLECT_Y`| 50    | Horizontal mirror axis for upper ↔ lower     |

Quadrant bounds (in viewBox units):

| Quadrant   | x range   | y range    |
|------------|-----------|------------|
| Tens       | 20 – 50   | 5 – 35     |
| Ones       | 50 – 80   | 5 – 35     |
| Thousands  | 20 – 50   | 65 – 95    |
| Hundreds   | 50 – 80   | 65 – 95    |

Digit paths are authored in the **ones** template using anchor points on the stem (`STEM_X`), the outer edge (`OUTER_X`), and the upper-row top/bottom (`TOP_Y`, `UPPER_ROW_BOTTOM_Y`). Other quadrants mirror via `QUADRANT_TRANSFORMS` in `src/glyph/cistercian.ts`.

## Export

Copied PNGs are **1:1 squares** at 320×320 px (`SVG_SIZE` in `src/glyph/glyphGeometry.ts`), preserving the same centered 2:3 glyph as the preview.

## Summary

| Rule                       | Value / behavior                            |
|----------------------------|---------------------------------------------|
| Glyph aspect ratio         | **2:3** — **2 = width**, **3 = height**     |
| Grid                       | **2 columns × 3 rows** of **1:1** squares   |
| Structural center          | **Vertical stem** on the column seam        |
| Upper encoding             | **Top two cells** (tens, ones)              |
| Lower encoding             | **Bottom two cells** (thousands, hundreds)  |
| Middle row                 | Stem only; separates upper / lower          |
| SVG viewBox                | **1:1** square (`0 0 100 100`)              |
| Copied PNG                 | **1:1** square (320×320)                    |
| Glyph in square canvas     | **2:3 body centered**, never stretched      |
| Digit construction         | Horizontal, diagonal, vertical segments     |
| Cross-quadrant consistency | Same segments, reflected orientations       |
