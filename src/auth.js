// Firebase Auth - Login/Logout Functions
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider as provider } from "./firebase.js";

// Login with Google
export async function login() {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("✅ Login success:", result.user);
    return result.user;
  } catch (e) {
    console.error("❌ Login error:", e);
    throw e;
  }
}

// Logout
export async function logout() {
  try {
    await signOut(auth);
    console.log("✅ Logged out");
  } catch (e) {
    console.error("❌ Logout error:", e);
  }
}

// Auth state observer
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

export { auth };
