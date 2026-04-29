// Firebase Configuration - Modular SDK
// ========================================

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD2yGNa9xRmT-ui4Hk6gqbTJbhzs3EL0As",
  authDomain: "studelab.firebaseapp.com",
  projectId: "studelab",
  appId: "1:545002317421:web:8cd69d3cc109df3c344164"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
