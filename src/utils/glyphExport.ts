import { GLYPH_FRAME_PADDING, GLYPH_HEIGHT, SVG_SIZE } from '../glyph/glyphGeometry';

const SVG_NS = 'http://www.w3.org/2000/svg';

const parseViewBox = (svg: SVGSVGElement) => {
  const [minX = 0, minY = 0, width = 100, height = 100] =
    svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [];

  return { minX, minY, width, height };
};

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Tailwind 4 colours compute to `oklch(...)`, which many SVG consumers (design tools,
 * image viewers) don't understand. Paint one pixel and read it back as plain hex.
 */
const toHexColor = (color: string) => {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!context) {
    return color;
  }

  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Serializes the on-screen glyph as a standalone SVG: frame padding is baked into the
 * viewBox, the current theme stroke colour is inlined, and any hover dimming is removed.
 * The glyph is SVG_SIZE px tall plus padding; width scales with the number of stems.
 */
export const buildExportSvg = (svg: SVGSVGElement) => {
  const { minX, minY, width, height } = parseViewBox(svg);
  // Padding is defined relative to the glyph body height, matching the on-screen preview.
  const padding = (GLYPH_FRAME_PADDING / GLYPH_HEIGHT) * height;
  const paddedWidth = width + 2 * padding;
  const paddedHeight = height + 2 * padding;
  // The glyph itself (viewBox content) is SVG_SIZE px tall; padding is added around it.
  const pxPerUnit = SVG_SIZE / height;
  const pixelHeight = Math.round(paddedHeight * pxPerUnit);
  const pixelWidth = Math.round(paddedWidth * pxPerUnit);
  const strokeColor = toHexColor(getComputedStyle(svg).color);
  const exportViewBox = [minX - padding, minY - padding, paddedWidth, paddedHeight].map(round);

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', SVG_NS);
  clone.setAttribute('viewBox', exportViewBox.join(' '));
  clone.setAttribute('width', String(pixelWidth));
  clone.setAttribute('height', String(pixelHeight));
  clone.setAttribute('stroke', strokeColor);
  clone.removeAttribute('class');
  clone.removeAttribute('style');
  clone.removeAttribute('role');
  clone.removeAttribute('aria-label');

  clone.querySelectorAll('[data-highlight]').forEach((element) => element.remove());
  clone.querySelectorAll<SVGElement>('*').forEach((element) => {
    element.removeAttribute('class');
    element.removeAttribute('style');
    element.removeAttribute('opacity');
  });

  return {
    text: new XMLSerializer().serializeToString(clone),
    width: pixelWidth,
    height: pixelHeight,
  };
};

export const svgToPngBlob = async (svg: SVGSVGElement): Promise<Blob> => {
  const { text, width, height } = buildExportSvg(svg);
  const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml;charset=utf-8' }));

  try {
    const image = new Image();
    image.decoding = 'async';

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Could not render the glyph as an image.'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is unavailable in this browser.');
    }

    context.drawImage(image, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('Could not create a PNG from the glyph.'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Give the browser a moment to start the download before releasing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
