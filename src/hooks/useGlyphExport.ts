import { type RefObject } from 'react';
import { useErrorToast } from '../errorToast';
import { buildExportSvg, downloadBlob, svgToPngBlob } from '../utils/glyphExport';

const toMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

/**
 * Copy and download actions for the on-screen glyph. Each resolves to whether it worked;
 * failures are reported as error toasts.
 *
 * @param fileStem file name without extension, e.g. `cistercian-2026-dark`
 */
export const useGlyphExport = (svgRef: RefObject<SVGSVGElement | null>, fileStem: string) => {
  const { pushError } = useErrorToast();

  const getSvg = () => {
    if (!svgRef.current) {
      throw new Error('The glyph isn’t ready yet.');
    }

    return svgRef.current;
  };

  const run = async (action: () => Promise<void> | void, fallback: string) => {
    try {
      await action();
      return true;
    } catch (error) {
      pushError(toMessage(error, fallback));
      return false;
    }
  };

  const copyImage = () =>
    run(async () => {
      const svg = getSvg();

      if (!('ClipboardItem' in window) || !navigator.clipboard?.write) {
        throw new Error('This browser can’t copy images. Try downloading instead.');
      }

      // Pass the PNG as a promise and call write() synchronously inside the click,
      // otherwise Safari drops the user gesture while the PNG renders and rejects the write.
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': svgToPngBlob(svg) })]);
    }, 'Copy failed.');

  const copyLink = () =>
    run(async () => {
      if (!navigator.clipboard?.writeText) {
        throw new Error('This browser can’t copy to the clipboard.');
      }

      // The URL hash always holds the current number, so the page URL is the share link.
      await navigator.clipboard.writeText(window.location.href);
    }, 'Copy failed.');

  const downloadPng = () =>
    run(async () => {
      downloadBlob(await svgToPngBlob(getSvg()), `${fileStem}.png`);
    }, 'Download failed.');

  const downloadSvg = () =>
    run(() => {
      const { text } = buildExportSvg(getSvg());
      downloadBlob(new Blob([text], { type: 'image/svg+xml' }), `${fileStem}.svg`);
    }, 'Download failed.');

  return { copyImage, copyLink, downloadPng, downloadSvg };
};
