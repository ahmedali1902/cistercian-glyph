import { SVG_SIZE } from '../glyph/constants';

/** Renders the 1:1 viewBox SVG to a square transparent PNG. @see docs/glyph-system.md */
export const svgToTransparentPngBlob = async (svg: SVGSVGElement): Promise<Blob> => {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(SVG_SIZE));
  clone.setAttribute('height', String(SVG_SIZE));

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
    canvas.width = SVG_SIZE;
    canvas.height = SVG_SIZE;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is unavailable in this browser.');
    }

    context.clearRect(0, 0, SVG_SIZE, SVG_SIZE);
    context.drawImage(image, 0, 0, SVG_SIZE, SVG_SIZE);

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
