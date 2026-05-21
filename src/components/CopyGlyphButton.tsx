type CopyGlyphButtonProps = {
  disabled: boolean;
  status: 'idle' | 'success' | 'error';
  message: string;
  onCopy: () => void;
};

export const CopyGlyphButton = ({ disabled, status, message, onCopy }: CopyGlyphButtonProps) => (
  <>
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled}
      className="h-11 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-300 dark:focus:ring-offset-zinc-950 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
    >
      Copy image
    </button>

    <p
      className={`min-h-5 text-center text-sm ${status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'
        }`}
      aria-live="polite"
    >
      {message}
    </p>
  </>
);
