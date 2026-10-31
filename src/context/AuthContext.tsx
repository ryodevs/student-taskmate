import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { User, Role } from '../types';
import * as auth from '../lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  googleLogin: (name: string, email: string, role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(auth.getCurrentUser());
    setLoading(false);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login: async (email, password) => setUser(await auth.loginEmail(email, password)),
    register: async (name, email, password, role) =>
      setUser(await auth.register(name, email, password, role)),
    googleLogin: async (name, email, role) =>
      setUser(await auth.loginGoogle(name, email, role)),
    logout: () => {
      auth.logout();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');

  return ctx;
}
