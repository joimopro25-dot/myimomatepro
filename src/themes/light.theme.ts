// src/themes/light.theme.ts
import { Theme } from '../types/theme.types';

export const lightTheme: Theme = {
 name: 'Corporate Light',
 mode: 'light',
 colors: {
   primary: {
     50: '#f0f9ff',
     100: '#e0f2fe',
     500: '#0ea5e9',
     600: '#0284c7',
     700: '#0369a1',
     900: '#0c4a6e'
   },
   background: {
     primary: '#ffffff',
     secondary: '#f8fafc',
     tertiary: '#f1f5f9'
   },
   text: {
     primary: '#0f172a',
     secondary: '#475569',
     muted: '#94a3b8',
     inverse: '#ffffff'
   },
   border: {
     light: '#e2e8f0',
     medium: '#cbd5e1',
     dark: '#94a3b8'
   },
   success: '#10b981',
   warning: '#f59e0b',
   error: '#ef4444',
   info: '#3b82f6'
 },
 fonts: {
   sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
   mono: 'JetBrains Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
 },
 spacing: {
   xs: '0.25rem',
   sm: '0.5rem',
   md: '1rem',
   lg: '1.5rem',
   xl: '2rem',
   '2xl': '3rem',
   '3xl': '4rem'
 },
 borderRadius: {
   none: '0px',
   sm: '0.25rem',
   md: '0.375rem',
   lg: '0.5rem',
   xl: '0.75rem',
   '2xl': '1rem',
   full: '9999px'
 },
 shadows: {
   sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
   md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
   lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
   xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
   inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
 }
};
