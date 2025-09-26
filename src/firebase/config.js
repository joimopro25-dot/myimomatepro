/**
 * FIREBASE CONFIGURATION - RealEstateCRM Pro
 * Initialize Firebase with environment variables
 * Supports emulators for local development
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpVNDGbjkA56gxt7IvOYGxkcpcyS0zH0k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "myimomatepro-b6775.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "myimomatepro-b6775",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "myimomatepro-b6775.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1025827380941",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1025827380941:web:7ed54a13221af8d9f8d384",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NST6FQ59EL"
};

// Validate configuration
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !firebaseConfig[key]);
  
  if (missing.length > 0) {
    console.error('Missing Firebase configuration:', missing);
    throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`);
  }
};

// Initialize Firebase
let app;
try {
  validateConfig();
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
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
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || 'localhost';
  
  try {
    // Connect Auth emulator
    const authPort = import.meta.env.VITE_AUTH_EMULATOR_PORT || 9099;
    connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, { 
      disableWarnings: true 
    });
    console.log(`Connected to Auth emulator at ${emulatorHost}:${authPort}`);

    // Connect Firestore emulator
    const firestorePort = import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080;
    connectFirestoreEmulator(db, emulatorHost, firestorePort);
    console.log(`Connected to Firestore emulator at ${emulatorHost}:${firestorePort}`);

    // Connect Storage emulator
    const storagePort = import.meta.env.VITE_STORAGE_EMULATOR_PORT || 9199;
    connectStorageEmulator(storage, emulatorHost, storagePort);
    console.log(`Connected to Storage emulator at ${emulatorHost}:${storagePort}`);
  } catch (error) {
    console.warn('Failed to connect to emulators:', error);
  }
}

// Helper functions
export const isEmulatorMode = () => {
  return import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
};

export const getAppConfig = () => {
  return {
    name: import.meta.env.VITE_APP_NAME || 'RealEstateCRM Pro',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
    isEmulator: isEmulatorMode(),
    features: {
      analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      errorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
      debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true'
    }
  };
};

// Export app instance
export default app;

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('Firebase initialized with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    emulators: isEmulatorMode()
  });
  console.log('App configuration:', getAppConfig());
}