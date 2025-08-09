
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { INITIAL_USERS } from '../constants';
import type { User as AppUser } from '../types';

// Self-contained types for this context to avoid external dependencies.
type User = { id: string; email: string; name?: string; role?: string };
type AuthCtx = {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<boolean>;
  logout(): void;
  isAuthenticated: boolean;
};
const AuthContext = createContext<AuthCtx | null>(null);
const LS = 'simple_session';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);

  // Load users from localStorage for login check
  useEffect(() => {
    try {
      const usersRaw = localStorage.getItem('users');
      setAllUsers(usersRaw ? JSON.parse(usersRaw) : INITIAL_USERS);
    } catch {
      setAllUsers(INITIAL_USERS);
    }
  }, []);

  // Check for existing session on initial load
  useEffect(() => {
    try { 
        const raw = localStorage.getItem(LS); 
        if (raw) {
            const storedUser = JSON.parse(raw);
            const fullUser = allUsers.find(u => u.username === storedUser.email);
            if (fullUser?.isApproved) {
                setUser(storedUser);
            } else {
                localStorage.removeItem(LS); // Clean up invalid session
            }
        }
    } catch {}
    setLoading(false);
  }, [allUsers]);

  // Login checks against the full user list
  const login = useCallback(async (email: string, password: string) => {
    const foundUser = allUsers.find(u => u.username.toLowerCase() === email.toLowerCase());

    if (foundUser && foundUser.password === password && foundUser.isApproved) {
        const u: User = { id: foundUser.username, email: foundUser.email, name: foundUser.fullName, role: foundUser.role };
        try { localStorage.setItem(LS, JSON.stringify(u)); } catch {}
        setUser(u);
        return true;
    }
    
    // Fallback for getting unblocked as requested, if no real user matches
    if (!foundUser && email && password) {
        console.warn("Dev login: No real user found. Authenticating with provided credentials.");
        const u: User = { id: email, email };
        try { localStorage.setItem(LS, JSON.stringify(u)); } catch {}
        setUser(u);
        return true;
    }

    return false;
  }, [allUsers]);

  const logout = useCallback(() => {
    try { localStorage.removeItem(LS); } catch {}
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user, loading, login, logout, isAuthenticated: !!user
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.error('AuthContext provider is missing');
    // return a harmless fallback to avoid crash
    return {
      user: null, loading: false,
      login: async () => false, logout: () => {},
      isAuthenticated: false
    } as AuthCtx;
  }
  return ctx;
}

export default AuthContext;
