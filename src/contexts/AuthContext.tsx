import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  registrationDateISO: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Development/Testing bypass
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'true') {
      console.warn('⚠️ ENTORNO DE PRUEBAS ACTIVO: Usando usuario mock');
      setUser({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: { creationTime: new Date().toISOString() },
      } as unknown as User);
      setLoading(false);
      return;
    }

    // If Firebase is not configured, skip auth
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      return;
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase not configured');
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase not configured');
    }

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const registrationDateISO = user?.metadata.creationTime
    ? (() => {
      const d = new Date(user.metadata.creationTime);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })()
    : null;

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
    registrationDateISO,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
