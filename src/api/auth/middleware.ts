import { Request, Response, NextFunction } from 'express';
import { sessionService, SessionData } from '../../lib/session';
import { COOKIE_NAMES } from '../../lib/cookies';
import { validateCsrfToken } from '../../lib/csrf';

declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
    }
  }
}

/**
 * Vérifie que la session est valide (cookie + Redis)
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionCookie = req.cookies?.[COOKIE_NAMES.SESSION];
  
  if (!sessionCookie) {
    return res.status(401).json({ error: 'No session', code: 'NO_SESSION' });
  }
  
  const session = await sessionService.validateSession(sessionCookie);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid session', code: 'INVALID_SESSION' });
  }
  
  // Vérifier aussi CSRF pour les méthodes mutantes
  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfValid = await validateCsrfToken(req);
    if (!csrfValid) {
      return res.status(403).json({ error: 'Invalid CSRF token', code: 'CSRF_INVALID' });
    }
  }
  
  req.session = session;
  next();
}

/**
 * Vérifie que la session a un des rôles autorisés
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) {
      return res.status(401).json({ error: 'No session' });
    }
    
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ 
        error: 'Insufficient role', 
        code: 'FORBIDDEN',
        required: roles,
        current: req.session.role,
      });
    }
    
    next();
  };
}

/**
 * Vérifie que la subscription est active
 */
export function requireSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    return res.status(401).json({ error: 'No session' });
  }
  
  // SUPER_ADMIN bypass
  if (req.session.role === 'SUPER_ADMIN') return next();
  
  if (!['trial', 'active'].includes(req.session.subscriptionStatus)) {
    return res.status(402).json({ 
      error: 'Subscription required', 
      code: 'NO_SUBSCRIPTION',
      status: req.session.subscriptionStatus,
    });
  }
  
  next();
}
