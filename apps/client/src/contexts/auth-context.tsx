'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    appType: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = api.getToken();
        const storedUser = localStorage.getItem('client_user');
        if (token && storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch { api.setToken(null); }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await api.login(email, password);
        setUser(data.user);
        localStorage.setItem('client_user', JSON.stringify(data.user));
    }, []);

    const logout = useCallback(async () => {
        await api.logout();
        setUser(null);
        localStorage.removeItem('client_user');
        window.location.href = '/login';
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
