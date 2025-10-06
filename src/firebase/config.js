/**
 * FIREBASE CONFIGURATION - RealEstateCRM Pro
 * Secure configuration using environment variables
 * Place this in: src/firebase/config.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
// NEVER hardcode credentials here - always use .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = required.filter(key => !firebaseConfig[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Firebase configuration:', missing);
    console.error('Please check your .env.local file');
    
    // Show helpful error in development
    if (import.meta.env.DEV) {
      console.error(`
        📋 Make sure your .env.local file contains:
        VITE_FIREBASE_API_KEY=your_api_key_here
        VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
        VITE_FIREBASE_PROJECT_ID=your_project_id_here
        VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
        VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
        VITE_FIREBASE_APP_ID=your_app_id_here
      `);
    }
    
    throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`);
  }
  
  console.log('✅ Firebase configuration validated successfully');
};

// Initialize Firebase
let app;
try {
  validateConfig();
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  throw error;
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
export let analytics = null;
if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  try {
    analytics = getAnalytics(app);
    console.log('✅ Analytics initialized');
  } catch (error) {
    console.warn('⚠️ Analytics initialization failed:', error);
  }
}

// Connect to emulators in development (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || 'localhost';
  
  try {
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { 
      disableWarnings: true 
    });
    connectFirestoreEmulator(db, emulatorHost, 8080);
    connectStorageEmulator(storage, emulatorHost, 9199);
    console.log('✅ Connected to Firebase emulators');
  } catch (error) {
    console.warn('⚠️ Emulator connection failed:', error);
  }
}

// Export the app instance
export default app;

// Helper to check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return app !== undefined && app !== null;
};