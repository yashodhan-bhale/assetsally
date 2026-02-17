import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://10.0.2.2:3001/api'; // Android emulator -> host machine
// For iOS simulator, use 'http://localhost:3001/api'
// For physical device, use your machine's IP

let accessToken: string | null = null;

export async function setToken(token: string | null) {
    accessToken = token;
    if (token) {
        await SecureStore.setItemAsync('accessToken', token);
    } else {
        await SecureStore.deleteItemAsync('accessToken');
    }
}

export async function getToken(): Promise<string | null> {
    if (accessToken) return accessToken;
    accessToken = await SecureStore.getItemAsync('accessToken');
    return accessToken;
}

export async function setRefreshToken(token: string | null) {
    if (token) {
        await SecureStore.setItemAsync('refreshToken', token);
    } else {
        await SecureStore.deleteItemAsync('refreshToken');
    }
}

export async function getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync('refreshToken');
}

export async function setUser(user: any) {
    if (user) {
        await SecureStore.setItemAsync('user', JSON.stringify(user));
    } else {
        await SecureStore.deleteItemAsync('user');
    }
}

export async function getUser(): Promise<any> {
    const raw = await SecureStore.getItemAsync('user');
    return raw ? JSON.parse(raw) : null;
}

async function request<T = any>(endpoint: string, options: { method?: string; body?: any } = {}): Promise<T> {
    const { method = 'GET', body } = options;
    const headers: Record<string, string> = {};

    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
        await setToken(null);
        await setRefreshToken(null);
        await setUser(null);
        throw new Error('SESSION_EXPIRED');
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }

    if (res.status === 204) return null as T;
    return res.json();
}

export const mobileApi = {
    // Auth
    login: (email: string, password: string) =>
        request('/auth/login', { method: 'POST', body: { email, password, appType: 'AUDITOR' } }),

    logout: async () => {
        const refreshToken = await getRefreshToken();
        try { await request('/auth/logout', { method: 'POST', body: { refreshToken } }); } catch { }
        await setToken(null);
        await setRefreshToken(null);
        await setUser(null);
    },

    // Audits
    getMyAudits: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/audits${qs}`);
    },

    getAudit: (id: string) => request(`/audits/${id}`),

    createAudit: (locationId: string) =>
        request('/audits', { method: 'POST', body: { locationId } }),

    submitFinding: (reportId: string, data: any) =>
        request(`/audits/${reportId}/findings`, { method: 'POST', body: data }),

    submitReport: (reportId: string) =>
        request(`/audits/${reportId}/submit`, { method: 'POST' }),

    // QR Tags
    lookupQrTag: (code: string) => request(`/qr-tags/${code}`),

    // Locations
    getLocations: () => request('/locations'),

    // Inventory
    getInventoryByLocation: (locationId: string) =>
        request(`/inventory?locationId=${locationId}`),
};
