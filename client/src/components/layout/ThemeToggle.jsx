import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle day/night mode"
      className="relative w-14 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors duration-300 flex items-center px-1 shrink-0"
    >
      <span
        className="absolute w-6 h-6 rounded-full bg-white dark:bg-zinc-900 shadow-md transition-transform duration-300 flex items-center justify-center"
        style={{ transform: dark ? 'translateX(24px)' : 'translateX(0px)' }}
      >
        {dark ? (
          <Moon size={14} className="text-zinc-300 fill-zinc-300" />
        ) : (
          <Sun size={14} className="text-amber-500 fill-amber-500" />
        )}
      </span>
    </button>
  );
}
