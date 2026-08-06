import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  generateSecureToken,
  hashToken,
} from './password';
import { signAccessToken, verifyAccessToken } from './jwt';
import { createSession, rotateRefreshToken, revokeSession, revokeAllUserSessions, getUserActiveSessions } from './session';
import { auditLog } from './audit';
import {
  checkLockout,
  recordFailedAttempt,
  resetFailedAttempts,
  getRecentFailuresByIp,
} from './lockout';
import { initiate2FASetup, verify2FACode, enable2FA, disable2FA } from './two-factor';

const router = express.Router();
const prisma = new PrismaClient();

// ===== HELPERS =====

function getClientInfo(req: Request): { ip: string; ua: string } {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '0.0.0.0';
  const ua = req.headers['user-agent'] || 'unknown';
  return { ip, ua };
}

async function enforceConstantDelay(startTime: number, minMs = 500): Promise<void> {
  const elapsed = Date.now() - startTime;
  if (elapsed < minMs) await new Promise(r => setTimeout(r, minMs - elapsed));
}

function setRefreshCookie(res: Response, token: string, expires: Date): void {
  res.cookie('biz_refresh', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie('biz_refresh', { path: '/api/auth' });
}

// ===== RATE LIMITERS =====

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Trop de créations de compte depuis cette IP.' },
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Trop de demandes de réinitialisation.' },
});

// ===== VALIDATION SCHEMAS =====

const RegisterSchema = z.object({
  email: z.string().email().max(254).transform(v => v.toLowerCase().trim()),
  password: z.string().min(12).max(128),
  name: z.string().min(2).max(100).trim(),
});

const LoginSchema = z.object({
  email: z.string().email().max(254).transform(v => v.toLowerCase().trim()),
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional().default(false),
  twoFactorCode: z.string().optional(),
});

const PasswordResetRequestSchema = z.object({
  email: z.string().email().max(254).transform(v => v.toLowerCase().trim()),
});

const PasswordResetCompleteSchema = z.object({
  token: z.string().min(32),
  newPassword: z.string().min(12).max(128),
});

// ===== MIDDLEWARE =====

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token requis' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = await verifyAccessToken(token);
    (req as any).auth = payload;
    next();
  } catch {
    res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Session expirée' });
  }
}

// ===== ROUTES =====

/** POST /api/auth/register */
router.post('/register', registerLimiter, async (req: Request, res: Response): Promise<void> => {
  const { ip, ua } = getClientInfo(req);

  try {
    const data = RegisterSchema.parse(req.body);

    // Valider la politique de mot de passe
    const pwValidation = validatePassword(data.password);
    if (!pwValidation.valid) {
      res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Mot de passe insuffisant',
        details: pwValidation.errors,
      });
      return;
    }

    // Vérifier email non déjà utilisé
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      // Constant time — ne pas révéler si l'email existe
      await hashPassword('dummyPasswordForConstantTime!1A');
      res.status(409).json({ error: 'EMAIL_TAKEN', message: 'Un compte avec cet email existe déjà.' });
      return;
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        emailVerified: false,
      },
    });

    // Enregistrer dans l'historique des mots de passe
    await prisma.passwordHistory.create({
      data: { userId: user.id, passwordHash },
    });

    // Créer un token de vérification d'email
    const verifyToken = generateSecureToken(32);
    const verifyTokenHash = hashToken(verifyToken);
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        email: user.email,
        tokenHash: verifyTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        ipAddress: ip,
      },
    });

    await auditLog({
      eventType: 'REGISTER',
      userId: user.id,
      email: user.email,
      ipAddress: ip,
      userAgent: ua,
      success: true,
      metadata: { verifyToken },
    });

    res.status(201).json({
      message: 'Compte créé. Veuillez vérifier votre email pour activer votre compte.',
      userId: user.id,
      // En prod, envoyer l'email. En dev, retourner le token pour test.
      ...(process.env.NODE_ENV !== 'production' && { _devVerifyToken: verifyToken }),
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'INVALID_INPUT', details: err.flatten() });
      return;
    }
    console.error('[Auth/register]', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

/** GET /api/auth/verify-email?token=... */
router.get('/verify-email', async (req: Request, res: Response): Promise<void> => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ error: 'MISSING_TOKEN' });
    return;
  }

  const tokenHash = hashToken(token);
  const record = await prisma.emailVerification.findFirst({
    where: {
      tokenHash,
      verifiedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    res.status(400).json({ error: 'INVALID_OR_EXPIRED_TOKEN' });
    return;
  }

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { verifiedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  await auditLog({ eventType: 'EMAIL_VERIFIED', userId: record.userId, email: record.email, success: true });

  res.json({ message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' });
});

/** POST /api/auth/login */
router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { ip, ua } = getClientInfo(req);

  try {
    const data = LoginSchema.parse(req.body);

    // 1. Rate limiting par IP (déjà appliqué par loginLimiter)
    const recentIpFailures = await getRecentFailuresByIp(ip);
    if (recentIpFailures >= 10) {
      res.status(429).json({ error: 'TOO_MANY_REQUESTS' });
      return;
    }

    // 2. Vérifier lockout
    const lockout = await checkLockout(data.email, ip);
    if (lockout.locked) {
      await auditLog({
        eventType: 'LOGIN_FAILED', email: data.email, ipAddress: ip, userAgent: ua,
        success: false, failureReason: 'ACCOUNT_LOCKED', metadata: { until: lockout.until },
      });
      res.status(423).json({
        error: 'ACCOUNT_LOCKED',
        message: `Compte verrouillé jusqu'à ${lockout.until?.toISOString()}`,
        until: lockout.until,
      });
      return;
    }

    // 3. Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || user.deletedAt) {
      // Hash dummy pour constant-time (évite l'énumération)
      await verifyPassword('$argon2id$v=19$m=65536,t=3,p=1$dummy$dummyhash123456789abcdef', data.password);
      await recordFailedAttempt({ email: data.email, ipAddress: ip, userAgent: ua, failureReason: 'USER_NOT_FOUND' });
      await enforceConstantDelay(startTime);
      res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect.' });
      return;
    }

    // 4. Email vérifié ?
    if (!user.emailVerified) {
      await auditLog({ eventType: 'LOGIN_FAILED', userId: user.id, email: data.email, ipAddress: ip, success: false, failureReason: 'EMAIL_NOT_VERIFIED' });
      res.status(403).json({ error: 'EMAIL_NOT_VERIFIED', message: 'Vérifiez votre email avant de vous connecter.' });
      return;
    }

    // 5. Vérifier mot de passe
    const passwordValid = await verifyPassword(user.passwordHash, data.password);
    if (!passwordValid) {
      await recordFailedAttempt({ userId: user.id, email: data.email, ipAddress: ip, userAgent: ua, failureReason: 'INVALID_PASSWORD' });
      await auditLog({ eventType: 'LOGIN_FAILED', userId: user.id, email: data.email, ipAddress: ip, userAgent: ua, success: false, failureReason: 'INVALID_PASSWORD' });
      await enforceConstantDelay(startTime);
      res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect.' });
      return;
    }

    // 6. 2FA requis pour admins ou si activé
    const requires2FA = user.twoFactorEnabled || user.role === 'SUPER_ADMIN' || user.role === 'FACILITY_MANAGER';
    if (requires2FA && user.twoFactorEnabled) {
      if (!data.twoFactorCode) {
        res.status(200).json({ requiresTwoFactor: true, message: 'Code 2FA requis.' });
        return;
      }
      const twoFaResult = await verify2FACode(user.id, data.twoFactorCode);
      if (!twoFaResult.verified) {
        await recordFailedAttempt({ userId: user.id, email: data.email, ipAddress: ip, userAgent: ua, failureReason: 'INVALID_2FA_CODE' });
        res.status(401).json({ error: 'INVALID_2FA_CODE', message: 'Code 2FA invalide.' });
        return;
      }
    }

    // 7. Créer la session
    const session = await createSession({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      ipAddress: ip,
      userAgent: ua,
      rememberMe: data.rememberMe,
    });

    // 8. Reset failed attempts + update last login
    await resetFailedAttempts(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    await auditLog({ eventType: 'LOGIN_SUCCESS', userId: user.id, organizationId: user.organizationId || undefined, email: user.email, ipAddress: ip, userAgent: ua, success: true, metadata: { sessionId: session.sessionId } });

    // 9. Refresh token en cookie HttpOnly
    setRefreshCookie(res, session.refreshToken, session.refreshTokenExpiry);

    res.json({
      accessToken: session.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      sessionId: session.sessionId,
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'INVALID_INPUT', details: err.flatten() });
      return;
    }
    console.error('[Auth/login]', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

/** POST /api/auth/refresh — Rotation du refresh token */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { ip, ua } = getClientInfo(req);
  const oldToken = req.cookies?.biz_refresh;

  if (!oldToken) {
    res.status(401).json({ error: 'NO_REFRESH_TOKEN' });
    return;
  }

  try {
    const result = await rotateRefreshToken(oldToken, ip, ua);
    setRefreshCookie(res, result.newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    res.json({ accessToken: result.accessToken, sessionId: result.sessionId });
  } catch (err: any) {
    clearRefreshCookie(res);
    res.status(401).json({ error: err.message || 'INVALID_TOKEN' });
  }
});

/** POST /api/auth/logout */
router.post('/logout', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const auth = (req as any).auth;
  const oldToken = req.cookies?.biz_refresh;
  const logoutAll = req.body?.logoutAll === true;

  if (logoutAll) {
    await revokeAllUserSessions(auth.userId, 'user_logout_all');
  } else {
    await revokeSession(auth.sessionId, auth.userId, 'user_logout');
  }

  clearRefreshCookie(res);
  await auditLog({ eventType: 'LOGOUT', userId: auth.userId, success: true, metadata: { logoutAll } });
  res.json({ message: 'Déconnecté avec succès.' });
});

/** POST /api/auth/password-reset/request */
router.post('/password-reset/request', resetLimiter, async (req: Request, res: Response): Promise<void> => {
  const { ip, ua } = getClientInfo(req);
  try {
    const { email } = PasswordResetRequestSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Toujours répondre success (anti-énumération)
    if (!user) {
      await enforceConstantDelay(0);
      res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
      return;
    }

    // Invalider anciens tokens
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { invalidatedAt: new Date() },
    });

    const token = generateSecureToken(32);
    const tokenHash = hashToken(token);

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress: ip,
        userAgent: ua,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
      },
    });

    await auditLog({ eventType: 'PASSWORD_RESET_REQUESTED', userId: user.id, email, ipAddress: ip, success: true });

    // En prod : envoyer email. En dev : retourner le token.
    res.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      ...(process.env.NODE_ENV !== 'production' && { _devResetToken: token }),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'INVALID_INPUT' });
      return;
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

/** POST /api/auth/password-reset/complete */
router.post('/password-reset/complete', async (req: Request, res: Response): Promise<void> => {
  const { ip } = getClientInfo(req);
  try {
    const { token, newPassword } = PasswordResetCompleteSchema.parse(req.body);

    const pwValidation = validatePassword(newPassword);
    if (!pwValidation.valid) {
      res.status(400).json({ error: 'WEAK_PASSWORD', details: pwValidation.errors });
      return;
    }

    const tokenHash = hashToken(token);
    const reset = await prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        invalidatedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!reset) {
      res.status(400).json({ error: 'INVALID_OR_EXPIRED_TOKEN', message: 'Token invalide ou expiré.' });
      return;
    }

    // Vérifier non réutilisé (5 derniers)
    const history = await prisma.passwordHistory.findMany({
      where: { userId: reset.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const h of history) {
      if (await verifyPassword(h.passwordHash, newPassword)) {
        res.status(400).json({ error: 'PASSWORD_REUSED', message: 'Vous ne pouvez pas réutiliser un mot de passe récent.' });
        return;
      }
    }

    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: reset.userId },
      data: {
        passwordHash: newHash,
        passwordChangedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
        mustChangePassword: false,
      },
    });

    await prisma.passwordHistory.create({ data: { userId: reset.userId, passwordHash: newHash } });
    await prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } });

    // Révoquer toutes les sessions (sécurité)
    await revokeAllUserSessions(reset.userId, 'password_reset');

    await auditLog({ eventType: 'PASSWORD_RESET_COMPLETED', userId: reset.userId, ipAddress: ip, success: true });

    res.json({ message: 'Mot de passe réinitialisé avec succès. Reconnectez-vous.' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'INVALID_INPUT', details: err.flatten() });
      return;
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

/** GET /api/auth/sessions — Lister les sessions actives */
router.get('/sessions', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).auth;
  const sessions = await getUserActiveSessions(userId);
  res.json({ sessions });
});

/** DELETE /api/auth/sessions/:sessionId — Révoquer une session spécifique */
router.delete('/sessions/:sessionId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).auth;
  await revokeSession(req.params.sessionId, userId, 'user_action');
  res.json({ message: 'Session révoquée.' });
});

/** POST /api/auth/2fa/setup */
router.post('/2fa/setup', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).auth;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) { res.status(404).json({ error: 'USER_NOT_FOUND' }); return; }

  const setup = await initiate2FASetup(userId, user.email);
  res.json({
    secret: setup.secret,
    qrCodeDataUrl: setup.qrCodeDataUrl,
    backupCodes: setup.backupCodes,
    message: 'Scannez le QR code, puis confirmez avec votre code TOTP via POST /api/auth/2fa/enable.',
  });
});

/** POST /api/auth/2fa/enable */
router.post('/2fa/enable', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).auth;
  const { code } = z.object({ code: z.string().regex(/^\d{6}$/) }).parse(req.body);
  await enable2FA(userId, code);
  res.json({ message: '2FA activé avec succès.' });
});

/** POST /api/auth/2fa/disable */
router.post('/2fa/disable', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).auth;
  const { code, password } = z.object({
    code: z.string(),
    password: z.string(),
  }).parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) { res.status(404).json({ error: 'USER_NOT_FOUND' }); return; }

  const [twoFaValid, pwValid] = await Promise.all([
    verify2FACode(userId, code),
    verifyPassword(user.passwordHash, password),
  ]);

  if (!twoFaValid.verified || !pwValid) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Code 2FA ou mot de passe incorrect.' });
    return;
  }

  await disable2FA(userId);
  res.json({ message: '2FA désactivé.' });
});

/** GET /api/auth/me — Utilisateur courant */
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).auth;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      twoFactorEnabled: true,
      emailVerified: true,
      lastLoginAt: true,
    },
  });
  if (!user) { res.status(404).json({ error: 'USER_NOT_FOUND' }); return; }
  res.json({ user });
});

export { router as authRouter };

