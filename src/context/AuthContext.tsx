import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

// ===== TYPES =====

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string | null;
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  accessToken: string | null;
  login: (email: string, password: string, opts?: { rememberMe?: boolean; twoFactorCode?: string }) => Promise<LoginResult>;
  register: (email: string, password: string, name: string) => Promise<RegisterResult>;
  logout: (logoutAll?: boolean) => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

interface LoginResult {
  success: boolean;
  requiresTwoFactor?: boolean;
  error?: string;
  details?: string[];
}

interface RegisterResult {
  success: boolean;
  error?: string;
  details?: string[];
}

// ===== CONTEXT =====

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Access token stocké UNIQUEMENT en mémoire (jamais localStorage)
let memoryAccessToken: string | null = null;

const ACCESS_TOKEN_REFRESH_INTERVAL = 12 * 60 * 1000; // Rafraîchir toutes les 12min (expire à 15min)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===== REFRESH TOKEN =====

  const refreshToken = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Envoie le cookie HttpOnly biz_refresh
      });

      if (!res.ok) {
        // Session expirée ou révoquée
        clearSession();
        return false;
      }

      const data = await res.json();
      memoryAccessToken = data.accessToken;
      setAccessToken(data.accessToken);
      return true;
    } catch {
      clearSession();
      return false;
    }
  };

  const clearSession = () => {
    memoryAccessToken = null;
    setAccessToken(null);
    setUser(null);
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const startRefreshTimer = () => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(async () => {
      const ok = await refreshToken();
      if (!ok) clearSession();
    }, ACCESS_TOKEN_REFRESH_INTERVAL);
  };

  // ===== INIT — Tenter de restaurer la session au démarrage =====

  useEffect(() => {
    const initSession = async () => {
      const ok = await refreshToken();
      if (ok) {
        // Décoder l'utilisateur depuis l'access token (JWT payload)
        try {
          const payload = parseJwtPayload(memoryAccessToken!);
          // Récupérer les infos complètes de l'utilisateur
          const userRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${memoryAccessToken}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.user);
            startRefreshTimer();
          }
        } catch {
          clearSession();
        }
      }
      setLoading(false);
    };

    initSession();

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, []);

  // ===== LOGIN =====

  const login = async (
    email: string,
    password: string,
    opts: { rememberMe?: boolean; twoFactorCode?: string } = {}
  ): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          rememberMe: opts.rememberMe ?? false,
          twoFactorCode: opts.twoFactorCode,
        }),
      });

      const data = await res.json();

      if (res.status === 200 && data.requiresTwoFactor) {
        return { success: false, requiresTwoFactor: true };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.error,
          details: data.details,
        };
      }

      // Stocker access token en mémoire seulement
      memoryAccessToken = data.accessToken;
      setAccessToken(data.accessToken);
      setUser(data.user);
      startRefreshTimer();

      return { success: true };
    } catch {
      return { success: false, error: 'NETWORK_ERROR' };
    }
  };

  // ===== REGISTER =====

  const register = async (email: string, password: string, name: string): Promise<RegisterResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error,
          details: data.details?.fieldErrors?.password || data.details,
        };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'NETWORK_ERROR' };
    }
  };

  // ===== LOGOUT =====

  const logout = async (logoutAll = false): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memoryAccessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ logoutAll }),
      });
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, login, register, logout, refreshToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

/** Décoder le payload d'un JWT (sans vérification — vérification faite côté serveur) */
function parseJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}
