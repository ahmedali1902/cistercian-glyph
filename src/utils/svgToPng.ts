import { GLYPH_FRAME_PADDING, GLYPH_HEIGHT, SVG_SIZE } from '../glyph/glyphGeometry';

const parseViewBox = (svg: SVGSVGElement) => {
  const [minX = 0, minY = 0, width = 100, height = 100] =
    svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [];

  return { minX, minY, width, height };
};

const applyStrokeColor = (svg: SVGSVGElement, strokeColor: string) => {
  svg.setAttribute('stroke', strokeColor);
  svg.style.color = strokeColor;

  svg.querySelectorAll<SVGGeometryElement>('path, circle, line').forEach((element) => {
    element.setAttribute('stroke', strokeColor);
  });
};

export const svgToTransparentPngBlob = async (svg: SVGSVGElement): Promise<Blob> => {
  const { width: viewBoxWidth, height: viewBoxHeight } = parseViewBox(svg);
  const contentPngHeight = SVG_SIZE;
  const contentPngWidth = Math.round((SVG_SIZE * viewBoxWidth) / viewBoxHeight);
  const framePaddingPx = Math.round((GLYPH_FRAME_PADDING / GLYPH_HEIGHT) * contentPngHeight);
  const pngWidth = contentPngWidth + 2 * framePaddingPx;
  const pngHeight = contentPngHeight + 2 * framePaddingPx;
  const strokeColor = getComputedStyle(svg).color;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(contentPngWidth));
  clone.setAttribute('height', String(contentPngHeight));
  applyStrokeColor(clone, strokeColor);

  const svgText = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = 'async';

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Could not render the SVG for copying.'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = pngWidth;
    canvas.height = pngHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is unavailable in this browser.');
    }

    context.clearRect(0, 0, pngWidth, pngHeight);
    context.drawImage(image, framePaddingPx, framePaddingPx, contentPngWidth, contentPngHeight);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('Could not create a PNG blob from the glyph.'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};
