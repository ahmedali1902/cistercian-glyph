import { ThemeToggle } from './ThemeToggle';

export const Header = ({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) => (
  <div className="flex w-full items-center justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Decimal to Cistercian numerals
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-normal">Cistercian Glyph</h1>
    </div>

    <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
  </div>
);
