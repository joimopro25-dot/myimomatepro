// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCBEWpmWFNFuyBWvo1Y9PuCf6slXCvMqgs",
  authDomain: "myimomatepro.firebaseapp.com",
  projectId: "myimomatepro",
  storageBucket: "myimomatepro.firebasestorage.app",
  messagingSenderId: "850691377911",
  appId: "1:850691377911:web:02660edcbb32a1a08e61f2",
  measurementId: "G-YD5C4Q9P7G"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;