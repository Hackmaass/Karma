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
  githubProvider,
  microsoftProvider,
  isFirebaseConfigured,
  BYPASS_FIREBASE,
} from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
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
    // If Firebase is bypassed or not configured, we default to a mock "Founder" user to bypass the login
    if (BYPASS_FIREBASE || !isFirebaseConfigured || !auth) {
      setCurrentUser({
        uid: 'mock-founder',
        email: 'founder@karmaos.ai',
        displayName: 'Hackmaass',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      } as User);
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // Fallback for demo: even if auth works but no user is logged in, we can still provide mock 
        // but typically if isFirebaseConfigured is true, we want real auth behavior.
        // However, the user said "bypass", so we stick to the mock if they want.
        setCurrentUser(null);
      }
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

  const loginWithGithub = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase is not configured yet. Please add your config to src/lib/firebase.ts");
      return;
    }
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error("Error signing in with GitHub", error);
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
    if (BYPASS_FIREBASE || !isFirebaseConfigured || !auth) {
      setCurrentUser(null);
      return;
    }
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
      loginWithGithub,
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
      loginWithGithub,
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
