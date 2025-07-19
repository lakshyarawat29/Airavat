'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

export default function ThemeClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('theme') === 'light'
        ? 'light'
        : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeProvider theme={theme} toggleTheme={toggleTheme}>
      {children}
    </ThemeProvider>
  );
}
