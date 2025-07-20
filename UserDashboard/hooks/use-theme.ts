'use client';

import { createContext, useContext } from 'react';

export interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const getThemeClasses = (theme: 'dark' | 'light') => {
  if (theme === 'light') {
    return {
      bg: 'bg-[#FDF0D5]',
      text: 'text-[#003049]',
      cardBg: 'bg-[#FDF0D5]/90',
      cardBorder: 'border-[#669BBC]',
      sectionBg: 'bg-[#FDF0D5]/50',
      mutedText: 'text-[#669BBC]',
      inputBg: 'bg-[#FDF0D5]',
      hoverBg: 'hover:bg-[#669BBC]/20',
      particleColor: 'bg-[#780000]',
      gradientOverlay:
        'bg-gradient-to-br from-[#780000]/10 via-[#003049]/10 to-[#669BBC]/10',
      sliderTrack: 'bg-[#669BBC]',
      switchUnchecked: 'bg-[#669BBC]',
    };
  }
  return {
    bg: 'bg-[#003049]',
    text: 'text-[#FDF0D5]',
    cardBg: 'bg-[#003049]/80',
    cardBorder: 'border-[#669BBC]',
    sectionBg: 'bg-[#003049]/60',
    mutedText: 'text-[#669BBC]',
    inputBg: 'bg-[#003049]',
    hoverBg: 'hover:bg-[#780000]/30',
    particleColor: 'bg-[#FDF0D5]',
    gradientOverlay:
      'bg-gradient-to-br from-[#780000]/20 via-[#003049]/20 to-[#669BBC]/20',
    sliderTrack: 'bg-[#669BBC]',
    switchUnchecked: 'bg-[#669BBC]',
  };
};
