// src/hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
 const context = useContext(ThemeContext);
 
 if (!context) {
   throw new Error('useTheme must be used within ThemeProvider');
 }
 
 const { 
   theme, 
   themeName, 
   toggleTheme, 
   setTheme, 
   isDark, 
   isLight,
   availableThemes 
 } = context;
 
 // Helper function to get CSS custom properties
 const getCSSVariable = (variable: string): string => {
   return theme.colors.primary[500]; // Example - would map to actual CSS vars
 };
 
 // Helper to apply theme classes
 const getThemeClass = (...classes: string[]): string => {
   const themePrefix = isDark ? 'dark:' : '';
   return classes.map(cls => ${themePrefix}).join(' ');
 };
 
 return {
   // Current theme data
   theme,
   themeName,
   isDark,
   isLight,
   
   // Theme switching functions
   toggleTheme,
   setTheme,
   availableThemes,
   
   // Utility functions
   getCSSVariable,
   getThemeClass,
   
   // Quick access to common colors
   colors: {
     primary: theme.colors.primary[500],
     background: theme.colors.background.primary,
     text: theme.colors.text.primary,
     border: theme.colors.border.medium,
     success: theme.colors.success,
     error: theme.colors.error,
     warning: theme.colors.warning,
     info: theme.colors.info
   }
 };
};

// Specialized hooks for specific theme aspects
export const useThemeColors = () => {
 const { theme } = useTheme();
 return theme.colors;
};

export const useThemeMode = () => {
 const { isDark, isLight, toggleTheme } = useTheme();
 return { isDark, isLight, toggleTheme };
};
