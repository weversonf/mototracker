/* MotoPulse — auth context: one deliberate entry point with Google sign-in, session restoration and graceful setup errors. */

import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { firebaseAuth, firebaseConfigured, googleProvider } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(
      firebaseAuth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      () => {
        setAuthError("Não foi possível restaurar sua sessão. Tente entrar novamente.");
        setLoading(false);
      },
    );
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: firebaseConfigured,
      authError,
      async signInWithGoogle() {
        setAuthError(null);
        if (!firebaseAuth) {
          const message = "O login ainda precisa das variáveis do Firebase configuradas na Vercel.";
          setAuthError(message);
          throw new Error(message);
        }

        try {
          await signInWithPopup(firebaseAuth, googleProvider);
        } catch (error) {
          const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
          const message = code.includes("popup-closed-by-user")
            ? "O acesso foi cancelado."
            : "Não foi possível entrar com Google. Verifique o domínio autorizado no Firebase.";
          setAuthError(message);
          throw error;
        }
      },
      async signOutUser() {
        if (firebaseAuth) await firebaseSignOut(firebaseAuth);
      },
    }),
    [authError, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  return context;
}

