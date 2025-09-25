// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpVNDGbjkA56gxt7IvOYGxkcpcyS0zH0k",
  authDomain: "myimomatepro-b6775.firebaseapp.com",
  projectId: "myimomatepro-b6775",
  storageBucket: "myimomatepro-b6775.firebasestorage.app",
  messagingSenderId: "1025827380941",
  appId: "1:1025827380941:web:7ed54a13221af8d9f8d384",
  measurementId: "G-NST6FQ59EL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export { analytics };
export default app;