import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Validate config
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0) {
  console.error('[Firebase] Missing configuration keys:', missingKeys.join(', '));
  console.error('[Firebase] Check your .env file. Required keys:');
  console.error('[Firebase] - REACT_APP_FIREBASE_API_KEY');
  console.error('[Firebase] - REACT_APP_FIREBASE_AUTH_DOMAIN');
  console.error('[Firebase] - REACT_APP_FIREBASE_PROJECT_ID');
  console.error('[Firebase] - REACT_APP_FIREBASE_STORAGE_BUCKET');
  console.error('[Firebase] - REACT_APP_FIREBASE_MESSAGING_SENDER_ID');
  console.error('[Firebase] - REACT_APP_FIREBASE_APP_ID');
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
