import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
 plugins: [react()],
 resolve: {
   alias: {
     '@': resolve(__dirname, 'src'),
   },
 },
 server: {
   host: '0.0.0.0',
   port: 3000,
   open: true,
 },
 build: {
   outDir: 'dist',
   assetsDir: 'assets',
   sourcemap: false,
   rollupOptions: {
     output: {
       manualChunks: {
         vendor: ['react', 'react-dom', 'react-router-dom'],
         firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
         ui: ['lucide-react'],
       },
     },
   },
 },
 define: {
   __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
 },
})
