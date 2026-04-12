import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace this with your actual Firebase config object
// You can find this in your Firebase Console under Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyC3sQNinu9kiMzNQ4JWjVm9LM2ZdLQFHtw",
  authDomain: "karmaos-ea327.firebaseapp.com",
  projectId: "karmaos-ea327",
  storageBucket: "karmaos-ea327.firebasestorage.app",
  messagingSenderId: "121343304320",
  appId: "1:121343304320:web:6f6108764ad9cefdc1bc65"
};

// --- EMERGENCY BYPASS ---
// Set this to true to ignore the config above and use mock data everywhere.
export const BYPASS_FIREBASE = true;

// We check if the config is valid so the app doesn't crash during the UI preview
export const isFirebaseConfigured = !BYPASS_FIREBASE && firebaseConfig.apiKey !== "YOUR_API_KEY";

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = isFirebaseConfigured ? getAuth(app!) : null;
export const db = isFirebaseConfigured ? getFirestore(app!) : null;
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({ prompt: 'select_account' });
