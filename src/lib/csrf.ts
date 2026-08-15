import { sealData, unsealData } from 'iron-session';
import { Request, Response } from 'express';
import crypto from 'crypto';

const CSRF_SECRET = process.env.SESSION_PASSWORD!;

export async function generateCsrfToken(res: Response): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const sealed = await sealData({ token, createdAt: Date.now() }, {
    password: CSRF_SECRET,
    ttl: 60 * 60 * 24,
  });
  
  res.cookie('bizos_csrf', sealed, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 1000,
  });
  
  return token;
}

export async function validateCsrfToken(req: Request): Promise<boolean> {
  const submittedToken = req.headers['x-csrf-token'] as string;
  const cookieSealed = req.cookies?.['bizos_csrf'];
  
  if (!submittedToken || !cookieSealed) return false;
  
  try {
    const data = await unsealData<{ token: string }>(cookieSealed, {
      password: CSRF_SECRET,
    });
    
    // Constant-time comparison
    const a = Buffer.from(data.token);
    const b = Buffer.from(submittedToken);
    
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
