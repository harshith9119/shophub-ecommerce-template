import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', lightNav = false }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === 'dark';

  if (!mounted) {
    return <span className={`inline-block w-9 h-9 ${className}`} aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-full transition-all duration-500 group ${
        lightNav
          ? 'text-white/90 hover:text-gold-light hover:bg-white/10'
          : 'text-charcoal dark:text-ivory/90 hover:text-gold dark:hover:text-gold-light hover:bg-cream/80 dark:hover:bg-white/5'
      } ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <Sun
        className={`w-[18px] h-[18px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
        strokeWidth={1.5}
      />
      <Moon
        className={`w-[18px] h-[18px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
        strokeWidth={1.5}
      />
    </button>
  );
}
