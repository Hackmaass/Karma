import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  microsoftProvider,
  isFirebaseConfigured,
} from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  sendSignInEmailLink: (email: string) => Promise<void>;
  completeSignInWithEmailLink: (email: string) => Promise<void>;
  isEmailLinkSignIn: () => boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase is not configured yet. Please add your config to src/lib/firebase.ts");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase is not configured yet. Please add your config to src/lib/firebase.ts");
      return;
    }
    try {
      await signInWithPopup(auth, microsoftProvider);
    } catch (error) {
      console.error("Error signing in with Microsoft", error);
      throw error;
    }
  }, []);

  const sendSignInEmailLink = useCallback(async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured");
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    await sendSignInLinkToEmail(auth, email, {
      url: `${origin}/login`,
      handleCodeInApp: true,
    });
  }, []);

  const completeSignInWithEmailLink = useCallback(async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured");
    }
    if (typeof window === "undefined") return;
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error("Invalid sign-in link");
    }
    await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem("emailForSignIn");
    window.history.replaceState({}, document.title, "/login");
  }, []);

  const isEmailLinkSignIn = useCallback(() => {
    if (!auth || typeof window === "undefined") return false;
    return isSignInWithEmailLink(auth, window.location.href);
  }, []);

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      loginWithGoogle,
      loginWithMicrosoft,
      sendSignInEmailLink,
      completeSignInWithEmailLink,
      isEmailLinkSignIn,
      logout,
    }),
    [
      currentUser,
      loading,
      loginWithGoogle,
      loginWithMicrosoft,
      sendSignInEmailLink,
      completeSignInWithEmailLink,
      isEmailLinkSignIn,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
