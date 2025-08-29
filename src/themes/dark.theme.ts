// src/themes/dark.theme.ts
import { Theme } from '../types/theme.types';

export const darkTheme: Theme = {
 name: 'Corporate Dark',
 mode: 'dark',
 colors: {
   primary: {
     50: '#0c4a6e',
     100: '#0369a1',
     500: '#0ea5e9',
     600: '#38bdf8',
     700: '#7dd3fc',
     900: '#e0f2fe'
   },
   background: {
     primary: '#0f172a',
     secondary: '#1e293b',
     tertiary: '#334155'
   },
   text: {
     primary: '#f1f5f9',
     secondary: '#cbd5e1',
     muted: '#94a3b8',
     inverse: '#0f172a'
   },
   border: {
     light: '#334155',
     medium: '#475569',
     dark: '#64748b'
   },
   success: '#22c55e',
   warning: '#eab308',
   error: '#f87171',
   info: '#60a5fa'
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
   sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
   md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
   lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
   xl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
   inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.15)'
 }
};
