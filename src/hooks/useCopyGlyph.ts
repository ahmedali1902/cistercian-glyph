import { type RefObject, useEffect, useRef, useState } from 'react';
import { useErrorToast } from '../errorToast';
import { svgToTransparentPngBlob } from '../utils/svgToPng';

const SUCCESS_RESET_MS = 1000;

type CopyStatus = 'idle' | 'success';

export const useCopyGlyph = (svgRef: RefObject<SVGSVGElement | null>, isValid: boolean) => {
  const { pushError } = useErrorToast();
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [message, setMessage] = useState('');
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSuccessTimer = () => {
    if (successTimerRef.current !== null) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  const reset = () => {
    clearSuccessTimer();
    setStatus('idle');
    setMessage('');
  };

  useEffect(() => clearSuccessTimer, []);

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
      successTimerRef.current = setTimeout(() => {
        setStatus('idle');
        setMessage('');
        successTimerRef.current = null;
      }, SUCCESS_RESET_MS);
    } catch (error) {
      pushError(error instanceof Error ? error.message : 'Copy failed.');
    }
  };

  return { status, message, copy, reset };
};
