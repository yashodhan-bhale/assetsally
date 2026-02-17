const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      if (typeof window !== "undefined")
        localStorage.setItem("accessToken", token);
    } else {
      if (typeof window !== "undefined") localStorage.removeItem("accessToken");
    }
  }

  getToken(): string | null {
    if (this.accessToken) return this.accessToken;
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
    }
    return this.accessToken;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    if (res.status === 204) return null as T;
    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        appType: string;
      };
    }>("/auth/login", {
      method: "POST",
      body: { email, password, appType: "ADMIN" },
    });
    this.setToken(data.accessToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  }

  async logout() {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null;
    try {
      await this.request("/auth/logout", {
        method: "POST",
        body: { refreshToken },
      });
    } catch {
      // Ignore errors on logout
    }
    this.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("refreshToken");
    }
  }

  // Locations
  getLocations(params?: Record<string, string>) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request(`/locations${qs}`);
  }
  getLocationTree() {
    return this.request("/locations/tree");
  }
  getLocation(id: string) {
    return this.request(`/locations/${id}`);
  }

  // Inventory
  getInventory(params?: Record<string, string>) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request(`/inventory${qs}`);
  }
  getInventoryItem(id: string) {
    return this.request(`/inventory/${id}`);
  }
  getInventoryStats() {
    return this.request("/inventory/stats");
  }

  // Audits
  getAudits(params?: Record<string, string>) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request(`/audits${qs}`);
  }
  getAuditReport(id: string) {
    return this.request(`/audits/${id}`);
  }
  reviewReport(id: string, action: string, notes?: string) {
    return this.request(`/audits/${id}/review`, {
      method: "POST",
      body: { action, reviewNotes: notes },
    });
  }

  // QR Tags
  getQrTags(params?: Record<string, string>) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request(`/qr-tags${qs}`);
  }
  generateQrBatch(count: number, prefix?: string) {
    return this.request("/qr-tags/generate", {
      method: "POST",
      body: { count, prefix },
    });
  }
  assignQrTag(code: string, itemId: string) {
    return this.request(`/qr-tags/${code}/assign`, {
      method: "POST",
      body: { itemId },
    });
  }

  // Imports
  uploadImport(file: File, type: "locations" | "inventory") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    // We need to bypass the default request method for FormData because it sets Content-Type to application/json
    // and we need browser to set multipart/form-data boundary
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE}/imports/upload`, {
      method: "POST",
      headers,
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || `HTTP ${res.status}`);
      }
      return res.json();
    });
  }

  wipeData() {
    return this.request("/imports/wipe", { method: "DELETE" });
  }
}

export const api = new ApiClient();
