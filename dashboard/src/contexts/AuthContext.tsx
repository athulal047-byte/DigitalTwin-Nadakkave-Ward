import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────

import type { UserRole } from '../types';

export interface AuthUser {
  user_id: string;
  username: string;
  full_name: string;
  role: UserRole;
  role_id?: number;
  department?: string;
  building_id?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (resource: string) => boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null);

const BASE = 'http://localhost:3000/api';

// ─── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Verify stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Token expired');
        return res.json();
      })
      .then(userData => {
        setUser(userData);
        setToken(storedToken);
      })
      .catch(() => {
        // Token invalid — try to refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return fetch(`${BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          })
            .then(res => {
              if (!res.ok) throw new Error('Refresh failed');
              return res.json();
            })
            .then(({ token: newToken }) => {
              localStorage.setItem('token', newToken);
              setToken(newToken);
              // Retry /me with new token
              return fetch(`${BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${newToken}` }
              }).then(r => r.json());
            })
            .then(setUser)
            .catch(() => {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              setToken(null);
              setUser(null);
            });
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch(`${BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch { /* ignore */ }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  }, [token]);

  const hasPermission = useCallback((resource: string) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'corporation') return true;
    if (user.role === 'citizen') {
      return ['buildings', 'roads', 'grievances', 'notifications', 'taxes', 'digital_twin'].includes(resource);
    }
    // Department logic
    const deptPrefix = user.role.replace('_dept', '');
    if (resource === deptPrefix) return true;
    return ['buildings', 'roads', 'grievances', 'notifications', 'digital_twin'].includes(resource);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      hasPermission,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
