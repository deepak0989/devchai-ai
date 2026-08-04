import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { User } from '../types';
import { api, getToken, setToken } from '../api/client';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  signInWithGoogle: () => Promise<void>;
  finalizeGoogleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getToken();
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const { user: me } = await api.me();
        if (!cancelled) setUser(me);
      } catch {
        setToken(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }, []);

  const finalizeGoogleSignIn = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session?.access_token) {
      throw new Error('Google sign-in did not complete');
    }

    setToken(session.access_token);
    const { user: me } = await api.me();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut().catch(() => undefined);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, signInWithGoogle, finalizeGoogleSignIn, logout }),
    [user, initializing, signInWithGoogle, finalizeGoogleSignIn, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}