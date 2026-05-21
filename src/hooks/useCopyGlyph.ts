import { type RefObject, useState } from 'react';
import { svgToTransparentPngBlob } from '../utils/svgToPng';

type CopyStatus = 'idle' | 'success' | 'error';

export const useCopyGlyph = (svgRef: RefObject<SVGSVGElement | null>, isValid: boolean) => {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [message, setMessage] = useState('');

  const reset = () => {
    setStatus('idle');
    setMessage('');
  };

  const copy = async () => {
    reset();

    try {
      if (!svgRef.current) {
        throw new Error('No glyph is available to copy.');
      }

      if (!isValid) {
        throw new Error('Enter a valid number before copying.');
      }

      if (!('ClipboardItem' in window) || !navigator.clipboard?.write) {
        throw new Error('This browser does not support copying image blobs.');
      }

      const pngBlob = await svgToTransparentPngBlob(svgRef.current);
      await navigator.clipboard.write([
        new ClipboardItem({
          [pngBlob.type]: pngBlob,
        }),
      ]);

      setStatus('success');
      setMessage('Copied transparent PNG');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Copy failed.');
    }
  };

  return { status, message, copy, reset };
};
