import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { sessionService } from '../../lib/session';
import { COOKIE_NAMES } from '../../lib/cookies';
import { validateCsrfToken } from '../../lib/csrf';

/**
 * Vérifie que la session est valide (cookie + Redis)
 */
export const requireAuthHono = createMiddleware(async (c, next) => {
  const sessionCookie = getCookie(c, COOKIE_NAMES.SESSION);
  
  if (!sessionCookie) {
    return c.json({ error: 'No session', code: 'NO_SESSION' }, 401);
  }
  
  const session = await sessionService.validateSession(sessionCookie);
  
  if (!session) {
    return c.json({ error: 'Invalid session', code: 'INVALID_SESSION' }, 401);
  }
  
  const method = c.req.method.toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    // Note: adapter validateCsrfToken pour hono
    const csrfValid = await validateCsrfToken({} as any);
    if (!csrfValid) {
      return c.json({ error: 'Invalid CSRF token', code: 'CSRF_INVALID' }, 403);
    }
  }
  
  c.set('session', session);
  await next();
});

/**
 * Vérifie que la session a un des rôles autorisés
 */
export function requireRoleHono(...roles: string[]) {
  return createMiddleware(async (c, next) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'No session' }, 401);
    }
    
    if (!roles.includes(session.role)) {
      return c.json({ 
        error: 'Insufficient role', 
        code: 'FORBIDDEN',
        required: roles,
        current: session.role,
      }, 403);
    }
    
    await next();
  });
}
