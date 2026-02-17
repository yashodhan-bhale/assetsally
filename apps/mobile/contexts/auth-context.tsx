import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { mobileApi, setToken, setRefreshToken, setUser, getToken, getUser } from '../lib/api';
import { router } from 'expo-router';

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
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                const stored = await getUser();
                if (token && stored) {
                    setUserState(stored);
                }
            } catch { }
            setIsLoading(false);
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await mobileApi.login(email, password);
        await setToken(data.accessToken);
        await setRefreshToken(data.refreshToken);
        await setUser(data.user);
        setUserState(data.user);
    }, []);

    const logout = useCallback(async () => {
        await mobileApi.logout();
        setUserState(null);
        router.replace('/');
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
