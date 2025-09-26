/**
 * MAIN ENTRY POINT - RealEstateCRM Pro
 * Application initialization with error handling
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Check for required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingEnvVars.length > 0 && import.meta.env.MODE === 'production') {
  console.error('Missing required environment variables:', missingEnvVars);
  document.getElementById('root').innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
      <div style="text-align: center;">
        <h1 style="color: #ef4444;">Configuration Error</h1>
        <p style="color: #6b7280;">Please contact support.</p>
      </div>
    </div>
  `;
} else {
  // Initialize React application
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Register service worker for PWA (optional)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  // You could send this to an error tracking service
});

// Detect online/offline status
window.addEventListener('online', () => {
  console.log('Application is online');
});

window.addEventListener('offline', () => {
  console.log('Application is offline');
  // You could show a notification to the user
});