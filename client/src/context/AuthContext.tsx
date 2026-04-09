import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthToken } from '../lib/api';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, role: UserRole, firstName: string, lastName: string) => Promise<User>;
  loginDemo: (role: 'student' | 'pi') => Promise<User>;
  loginWithGoogle: (credential: string, role?: UserRole) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'rh_token';

function persist(token: string, u: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('rh_user', JSON.stringify(u));
}

function clear() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('rh_user');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on every page load
  const loadUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem('rh_user');
      if (storedToken && storedUser) {
        setAuthToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
        // Verify token is still valid with the server
        try {
          const u = await api.auth.me();
          setUser(u);
        } catch {
          // Token expired — clear everything
          clear();
          setAuthToken(null);
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const { token, user: u } = await api.auth.login({ email, password });
    setAuthToken(token);
    setUser(u);
    persist(token, u);
    return u;
  };

  const register = async (
    email: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName: string
  ) => {
    const { token, user: u } = await api.auth.register({
      email,
      password,
      role,
      firstName,
      lastName,
    });
    setAuthToken(token);
    setUser(u);
    persist(token, u);
    return u;
  };

  const loginWithGoogle = async (credential: string, role?: UserRole) => {
    const { token, user: u } = await api.auth.google({ credential, role });
    setAuthToken(token);
    setUser(u);
    persist(token, u);
    return u;
  };

  const loginDemo = async (role: 'student' | 'pi') => {
    const { token, user: u } = await api.auth.demo(role);
    setAuthToken(token);
    setUser(u);
    persist(token, u);
    return u;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginDemo, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
