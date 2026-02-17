const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
}

class ClientApi {
    private accessToken: string | null = null;

    setToken(token: string | null) {
        this.accessToken = token;
        if (token) {
            if (typeof window !== 'undefined') localStorage.setItem('client_accessToken', token);
        } else {
            if (typeof window !== 'undefined') localStorage.removeItem('client_accessToken');
        }
    }

    getToken(): string | null {
        if (this.accessToken) return this.accessToken;
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('client_accessToken');
        }
        return this.accessToken;
    }

    async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

        const res = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (res.status === 401) {
            this.setToken(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('client_refreshToken');
                window.location.href = '/login';
            }
            throw new Error('Unauthorized');
        }

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${res.status}`);
        }

        if (res.status === 204) return null as T;
        return res.json();
    }

    async login(email: string, password: string) {
        const data = await this.request<{
            accessToken: string;
            refreshToken: string;
            user: { id: string; email: string; name: string; role: string; appType: string };
        }>('/auth/login', {
            method: 'POST',
            body: { email, password, appType: 'CLIENT' },
        });
        this.setToken(data.accessToken);
        if (typeof window !== 'undefined') localStorage.setItem('client_refreshToken', data.refreshToken);
        return data;
    }

    async logout() {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('client_refreshToken') : null;
        try { await this.request('/auth/logout', { method: 'POST', body: { refreshToken } }); } catch { }
        this.setToken(null);
        if (typeof window !== 'undefined') localStorage.removeItem('client_refreshToken');
    }

    // Read-only endpoints
    getLocations() { return this.request('/locations'); }
    getLocationTree() { return this.request('/locations/tree'); }
    getInventory(params?: Record<string, string>) {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/inventory${qs}`);
    }
    getInventoryStats() { return this.request('/inventory/stats'); }
    getAudits(params?: Record<string, string>) {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/audits${qs}`);
    }
}

export const api = new ClientApi();
