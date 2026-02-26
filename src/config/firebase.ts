import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here'
  );
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Optional: Add custom parameters to the Google provider
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured. Using localStorage as fallback.');
  console.warn('📝 To enable cloud sync, add Firebase credentials to .env file');
}

export { app, db, auth, googleProvider };
