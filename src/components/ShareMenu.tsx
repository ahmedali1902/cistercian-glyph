import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import checkIcon from '../assets/icons/check.svg?raw';
import downloadIcon from '../assets/icons/download.svg?raw';
import imageIcon from '../assets/icons/image.svg?raw';
import linkIcon from '../assets/icons/link.svg?raw';
import shareIcon from '../assets/icons/share.svg?raw';
import { Icon } from './Icon';

/** How long a "Copied" confirmation shows before the menu closes. */
const CONFIRM_MS = 900;

type ShareAction = () => Promise<boolean>;

type ShareMenuProps = {
  onCopyImage: ShareAction;
  onCopyLink: ShareAction;
  onDownloadPng: ShareAction;
  onDownloadSvg: ShareAction;
};

type ItemId = 'image' | 'link' | 'png' | 'svg';

export const ShareMenu = ({
  onCopyImage,
  onCopyLink,
  onDownloadPng,
  onDownloadSvg,
}: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<ItemId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const items: Array<{
    id: ItemId;
    label: string;
    doneLabel?: string;
    icon: string;
    action: ShareAction;
    separatorBefore?: boolean;
  }> = [
    {
      id: 'image',
      label: 'Copy image',
      doneLabel: 'Image copied',
      icon: imageIcon,
      action: onCopyImage,
    },
    {
      id: 'link',
      label: 'Copy link',
      doneLabel: 'Link copied',
      icon: linkIcon,
      action: onCopyLink,
    },
    {
      id: 'png',
      label: 'Download PNG',
      icon: downloadIcon,
      action: onDownloadPng,
      separatorBefore: true,
    },
    { id: 'svg', label: 'Download SVG', icon: downloadIcon, action: onDownloadSvg },
  ];

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const close = (returnFocus = false) => {
    clearCloseTimer();
    setIsOpen(false);
    setConfirmed(null);
    if (returnFocus) {
      buttonRef.current?.focus();
    }
  };

  const getMenuItems = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]') ?? []);

  const open = () => {
    clearCloseTimer();
    setConfirmed(null);
    setIsOpen(true);
  };

  // Focus the first item when the menu opens; close on any click outside.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    getMenuItems()[0]?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when opening/closing
  }, [isOpen]);

  useEffect(() => clearCloseTimer, []);

  const handleSelect = (id: ItemId, action: ShareAction, confirms: boolean) => {
    // Call the action straight away (inside the click) so clipboard writes keep the gesture.
    const result = action();

    if (!confirms) {
      close(true);
      return;
    }

    // Copies show a brief "copied" confirmation in place, then the menu closes.
    void result.then((ok) => {
      if (!ok) {
        close(true);
        return;
      }

      setConfirmed(id);
      clearCloseTimer();
      closeTimerRef.current = setTimeout(() => close(true), CONFIRM_MS);
    });
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const menuItems = getMenuItems();
    const index = menuItems.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (next: number) =>
      menuItems[(next + menuItems.length) % menuItems.length]?.focus();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAt(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusAt(menuItems.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'Tab':
        close();
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !isOpen) {
            event.preventDefault();
            open();
          }
        }}
        className={`surface-raised inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-medium focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500 ${
          isOpen
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100'
        }`}
      >
        <Icon src={shareIcon} className="h-4 w-4" />
        Share
      </button>

      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label="Share"
        hidden={!isOpen}
        onKeyDown={handleMenuKeyDown}
        className="share-menu surface-popover absolute top-full left-1/2 z-30 mt-2.5 w-52 -translate-x-1/2 rounded-2xl p-1.5"
      >
        {items.map(({ id, label, doneLabel, icon, action, separatorBefore }) => {
          const isDone = confirmed === id;

          return (
            <div key={id}>
              {separatorBefore && (
                <div
                  role="separator"
                  className="mx-2.5 my-1.5 h-px bg-zinc-200/70 dark:bg-white/[0.07]"
                />
              )}
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => handleSelect(id, action, doneLabel !== undefined)}
                className="flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-sm text-zinc-700 transition-colors duration-150 outline-none hover:bg-zinc-100 focus-visible:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:focus-visible:bg-white/[0.06]"
              >
                <Icon
                  src={isDone ? checkIcon : icon}
                  className={`h-4 w-4 ${isDone ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`}
                />
                <span aria-live="polite">{isDone ? doneLabel : label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
