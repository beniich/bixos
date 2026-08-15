export const COOKIE_NAMES = {
  SESSION: 'bizos_sess',
  REFRESH: 'bizos_ref',
  CSRF: 'bizos_csrf',
} as const;

const isProd = process.env.NODE_ENV === 'production';

const baseCookieOptions = {
  httpOnly: true,                    // Anti-XSS
  secure: isProd,                    // HTTPS only in prod
  sameSite: 'lax' as const,          // Anti-CSRF (bon compromis)
  path: '/',
};

export const SESSION_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 24 * 7,          // 7 jours
};

export const REFRESH_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 24 * 30,         // 30 jours
  path: '/api/auth/refresh',         // Scoped au refresh
};

export const CSRF_COOKIE_OPTIONS = {
  httpOnly: false,                   // DOIT être lu par le JS (double-submit)
  secure: isProd,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24,
};

// Helpers
export function clearAllAuthCookies(res: any) {
  res.clearCookie(COOKIE_NAMES.SESSION);
  res.clearCookie(COOKIE_NAMES.REFRESH);
  res.clearCookie(COOKIE_NAMES.CSRF);
}
