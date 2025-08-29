// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types/theme.types';
import { lightTheme } from '../themes/light.theme';
import { darkTheme } from '../themes/dark.theme';

type ThemeName = 'light' | 'dark';

interface ThemeContextType {
 theme: Theme;
 themeName: ThemeName;
 toggleTheme: () => void;
 setTheme: (themeName: ThemeName) => void;
 isDark: boolean;
 isLight: boolean;
 availableThemes: ThemeName[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
 children: ReactNode;
 defaultTheme?: ThemeName;
}

const themes: Record<ThemeName, Theme> = {
 light: lightTheme,
 dark: darkTheme
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
 children,
 defaultTheme = 'light'
}) => {
 const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
 const [theme, setThemeData] = useState<Theme>(themes[defaultTheme]);

 // Initialize theme from localStorage or system preference
 useEffect(() => {
   const savedTheme = localStorage.getItem('myimomatepro-theme') as ThemeName;
   const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
   
   let initialTheme = defaultTheme;
   
   if (savedTheme && themes[savedTheme]) {
     initialTheme = savedTheme;
   } else if (systemPrefersDark) {
     initialTheme = 'dark';
   }
   
   setThemeName(initialTheme);
 }, [defaultTheme]);

 // Update theme data when theme name changes
 useEffect(() => {
   setThemeData(themes[themeName]);
   
   // Apply CSS custom properties to root
   const root = document.documentElement;
   const colors = themes[themeName].colors;
   
   // Primary colors
   root.style.setProperty('--color-primary-50', colors.primary[50]);
   root.style.setProperty('--color-primary-100', colors.primary[100]);
   root.style.setProperty('--color-primary-500', colors.primary[500]);
   root.style.setProperty('--color-primary-600', colors.primary[600]);
   root.style.setProperty('--color-primary-700', colors.primary[700]);
   root.style.setProperty('--color-primary-900', colors.primary[900]);
   
   // Background colors
   root.style.setProperty('--color-bg-primary', colors.background.primary);
   root.style.setProperty('--color-bg-secondary', colors.background.secondary);
   root.style.setProperty('--color-bg-tertiary', colors.background.tertiary);
   
   // Text colors
   root.style.setProperty('--color-text-primary', colors.text.primary);
   root.style.setProperty('--color-text-secondary', colors.text.secondary);
   root.style.setProperty('--color-text-muted', colors.text.muted);
   root.style.setProperty('--color-text-inverse', colors.text.inverse);
   
   // Border colors
   root.style.setProperty('--color-border-light', colors.border.light);
   root.style.setProperty('--color-border-medium', colors.border.medium);
   root.style.setProperty('--color-border-dark', colors.border.dark);
   
   // Status colors
   root.style.setProperty('--color-success', colors.success);
   root.style.setProperty('--color-warning', colors.warning);
   root.style.setProperty('--color-error', colors.error);
   root.style.setProperty('--color-info', colors.info);
   
   // Add dark/light class to body for Tailwind
   document.body.classList.remove('light', 'dark');
   document.body.classList.add(themeName);
   
   console.log(\Theme switched to: \\);
 }, [themeName]);

 const toggleTheme = () => {
   const newTheme = themeName === 'light' ? 'dark' : 'light';
   setTheme(newTheme);
 };

 const setTheme = (newTheme: ThemeName) => {
   setThemeName(newTheme);
   localStorage.setItem('myimomatepro-theme', newTheme);
 };

 // Listen for system theme changes
 useEffect(() => {
   const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
   
   const handleChange = (e: MediaQueryListEvent) => {
     // Only auto-change if user hasn't manually set a preference
     const savedTheme = localStorage.getItem('myimomatepro-theme');
     if (!savedTheme) {
       setThemeName(e.matches ? 'dark' : 'light');
     }
   };

   mediaQuery.addEventListener('change', handleChange);
   return () => mediaQuery.removeEventListener('change', handleChange);
 }, []);

 const value: ThemeContextType = {
   theme,
   themeName,
   toggleTheme,
   setTheme,
   isDark: themeName === 'dark',
   isLight: themeName === 'light',
   availableThemes: Object.keys(themes) as ThemeName[]
 };

 return (
   <ThemeContext.Provider value={value}>
     {children}
   </ThemeContext.Provider>
 );
};
