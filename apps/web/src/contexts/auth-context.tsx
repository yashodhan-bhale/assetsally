"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { api } from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  appType: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, appType?: "ADMIN" | "CLIENT" | "WEB") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = api.getToken();
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setTokenState(token);
        setUser(JSON.parse(storedUser));
      } catch {
        api.setToken(null);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, appType?: "ADMIN" | "CLIENT" | "WEB") => {
    const data = await api.login(email, password, appType);
    setUser(data.user);
    setTokenState(data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setTokenState(null);
    localStorage.removeItem("user");
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
