/** @type {import('tailwindcss').Config} */
export default {
 content: [
   "./index.html",
   "./src/**/*.{js,ts,jsx,tsx}",
 ],
 darkMode: 'class',
 theme: {
   extend: {
     fontFamily: {
       sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
     },
     colors: {
       primary: {
         50: 'var(--color-primary-50, #f0f9ff)',
         100: 'var(--color-primary-100, #e0f2fe)',
         500: 'var(--color-primary-500, #0ea5e9)',
         600: 'var(--color-primary-600, #0284c7)',
         700: 'var(--color-primary-700, #0369a1)',
         900: 'var(--color-primary-900, #0c4a6e)',
       },
       background: {
         primary: 'var(--color-bg-primary, #ffffff)',
         secondary: 'var(--color-bg-secondary, #f8fafc)',
         tertiary: 'var(--color-bg-tertiary, #f1f5f9)',
       },
       text: {
         primary: 'var(--color-text-primary, #0f172a)',
         secondary: 'var(--color-text-secondary, #475569)',
         muted: 'var(--color-text-muted, #94a3b8)',
         inverse: 'var(--color-text-inverse, #ffffff)',
       },
       border: {
         light: 'var(--color-border-light, #e2e8f0)',
         medium: 'var(--color-border-medium, #cbd5e1)',
         dark: 'var(--color-border-dark, #94a3b8)',
       },
       success: 'var(--color-success, #10b981)',
       warning: 'var(--color-warning, #f59e0b)',
       error: 'var(--color-error, #ef4444)',
       info: 'var(--color-info, #3b82f6)',
     },
     animation: {
       'spin': 'spin 1s linear infinite',
       'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
       'bounce': 'bounce 1s infinite',
     },
     transitionProperty: {
       'height': 'height',
       'spacing': 'margin, padding',
     }
   },
 },
 plugins: [
   // Add custom utilities
   function({ addUtilities }) {
     addUtilities({
       '.scrollbar-hide': {
         /* IE and Edge */
         '-ms-overflow-style': 'none',
         /* Firefox */
         'scrollbar-width': 'none',
         /* Safari and Chrome */
         '&::-webkit-scrollbar': {
           display: 'none'
         }
       }
     })
   }
 ],
}
