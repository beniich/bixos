// Wrapper fetch avec auto-refresh + CSRF + cookies

interface FetchOptions extends RequestInit {
  skipRefresh?: boolean;
  retry?: boolean;
}

class ApiClient {
  private csrfToken: string | null = null;
  
  async getCsrfToken(): Promise<string> {
    // Lit depuis cookie (HttpOnly=false pour CSRF)
    const match = document.cookie.match(/bizos_csrf=([^;]+)/);
    if (match) {
      this.csrfToken = match[1];
      return this.csrfToken;
    }
    
    // Sinon, fetch un nouveau
    const res = await fetch('/api/auth/csrf', { credentials: 'include' });
    const data = await res.json();
    this.csrfToken = data.token;
    return this.csrfToken;
  }
  
  async fetch(url: string, options: FetchOptions = {}): Promise<Response> {
    const method = (options.method ?? 'GET').toUpperCase();
    const needsCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method);
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> ?? {}),
    };
    
    if (!(options.body instanceof FormData) && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }
    
    if (needsCsrf) {
      headers['x-csrf-token'] = await this.getCsrfToken();
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',  // ← Envoie cookies
    });
    
    // Auto-refresh sur 401
    if (response.status === 401 && !options.skipRefresh && !options.retry) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        return this.fetch(url, { ...options, retry: true });
      }
      // Échec → redirect login
      window.location.href = '/login';
    }
    
    return response;
  }
  
  private async tryRefresh(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  }
  
  // Helpers
  async get<T = any>(url: string): Promise<T> {
    const res = await this.fetch(url);
    if (!res.ok) throw new ApiError(res);
    return res.json();
  }
  
  async post<T = any>(url: string, body: any): Promise<T> {
    const res = await this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ApiError(res);
    return res.json();
  }
  
  async delete<T = any>(url: string): Promise<T> {
    const res = await this.fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new ApiError(res);
    return res.json();
  }
}

export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(response: Response) {
    super(`HTTP ${response.status}`);
    this.status = response.status;
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();
