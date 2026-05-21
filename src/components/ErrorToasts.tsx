import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dismissIcon from '../assets/icons/dismiss.svg?raw';
import { ErrorToastContext, type ErrorToast } from '../errorToast';
import { Icon } from './Icon';

const AUTO_DISMISS_MS = 2000;

let nextToastId = 0;

const ErrorToastItem = ({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) => {
  const [progress, setProgress] = useState(1);
  const startedAtRef = useRef(0);
  const pausedMsRef = useRef(0);
  const pauseStartedAtRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    pauseStartedAtRef.current = Date.now();
  };

  const handleMouseLeave = () => {
    if (pauseStartedAtRef.current !== null) {
      pausedMsRef.current += Date.now() - pauseStartedAtRef.current;
      pauseStartedAtRef.current = null;
    }
  };

  useEffect(() => {
    startedAtRef.current = Date.now();
    let frame = 0;

    const tick = () => {
      const pauseOffset =
        pauseStartedAtRef.current !== null ? Date.now() - pauseStartedAtRef.current : 0;
      const elapsed = Date.now() - startedAtRef.current - pausedMsRef.current - pauseOffset;
      const remaining = Math.max(0, 1 - elapsed / AUTO_DISMISS_MS);

      setProgress(remaining);

      if (remaining <= 0) {
        onDismiss();
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="pointer-events-auto max-w-xs overflow-hidden rounded-lg border border-red-200/80 bg-white/95 shadow-lg shadow-zinc-900/5 backdrop-blur-sm dark:border-red-900/60 dark:bg-zinc-900/95 dark:shadow-black/30"
    >
      <div className="h-1 bg-red-100 dark:bg-red-950/80" aria-hidden>
        <div
          className="h-full bg-red-500 transition-none dark:bg-red-400"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex min-h-12 items-start gap-2 px-3.5 py-3">
        <p className="flex-1 pt-0.5 text-sm leading-snug text-red-800 dark:text-red-200">
          {message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-0.5 shrink-0 rounded-md p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 dark:text-red-500 dark:hover:bg-red-950/60 dark:hover:text-red-200"
        >
          <Icon src={dismissIcon} />
        </button>
      </div>
    </div>
  );
};

const ErrorToastStack = ({
  toasts,
  onDismiss,
}: {
  toasts: ErrorToast[];
  onDismiss: (id: number) => void;
}) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed right-8 bottom-8 z-50 flex w-full max-w-xs flex-col gap-2.5"
    >
      {toasts.map((toast) => (
        <ErrorToastItem
          key={toast.id}
          message={toast.message}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
};

export const ErrorToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ErrorToast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushError = useCallback((message: string) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    setToasts((current) => [...current, { id: ++nextToastId, message: trimmed }]);
  }, []);

  const value = useMemo(() => ({ pushError }), [pushError]);

  return (
    <ErrorToastContext.Provider value={value}>
      {children}
      <ErrorToastStack toasts={toasts} onDismiss={dismiss} />
    </ErrorToastContext.Provider>
  );
};
