// src/themes/index.ts
export { lightTheme } from './light.theme';
export { darkTheme } from './dark.theme';

// Export all available themes
export const availableThemes = {
 light: () => import('./light.theme').then(m => m.lightTheme),
 dark: () => import('./dark.theme').then(m => m.darkTheme)
} as const;

// Theme utilities
export const getThemeByName = async (themeName: 'light' | 'dark') => {
 const themeLoader = availableThemes[themeName];
 return await themeLoader();
};

// Default theme
export const defaultTheme = 'light';

// Theme metadata
export const themeMetadata = {
 light: {
   name: 'Corporate Light',
   description: 'Clean and professional light theme',
   suitable: ['day', 'office', 'presentation']
 },
 dark: {
   name: 'Corporate Dark', 
   description: 'Modern dark theme with reduced eye strain',
   suitable: ['night', 'low-light', 'focus']
 }
} as const;
