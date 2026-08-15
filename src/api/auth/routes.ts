import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../../prisma';
import { sessionService } from '../../lib/session';
import { generateCsrfToken } from '../../lib/csrf';
import { COOKIE_NAMES, SESSION_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS, clearAllAuthCookies } from '../../lib/cookies';
import { requireAuth } from './middleware';

const router = Router();

// ============== SCHEMAS ==============

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceId: z.string().min(1),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  deviceId: z.string().min(1),
});

// ============== POST /api/auth/register ==============

router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name, deviceId } = RegisterSchema.parse(req.body);

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use', code: 'EMAIL_TAKEN' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: 'FACILITY_MANAGER',
        isSuperAdmin: false,
        emailVerified: false,
      },
    });

    const ipAddress = req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'unknown';
    const userAgent = req.headers['user-agent'] ?? 'unknown';

    const { sessionCookie, refreshCookie } = await sessionService.createSession(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        displayName: user.name,
        isSuperAdmin: user.isSuperAdmin,
        permissions: [],
        subscriptionStatus: 'trial',
        subscriptionPlan: 'free',
      },
      { deviceId, ipAddress, userAgent }
    );

    res.cookie(COOKIE_NAMES.SESSION, sessionCookie, SESSION_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH, refreshCookie, REFRESH_COOKIE_OPTIONS);

    const csrfToken = await generateCsrfToken(res);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        organizationId: user.organizationId,
      },
      csrfToken,
    });

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: err.issues });
    }
    console.error('[REGISTER]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});


router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, deviceId } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { organization: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({
        error: 'Account locked',
        code: 'LOCKED',
        lockedUntil: user.lockedUntil,
      });
    }

    const ipAddress = req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'unknown';
    const userAgent = req.headers['user-agent'] ?? 'unknown';

    const { sessionCookie, refreshCookie } = await sessionService.createSession(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        displayName: user.name,
        isSuperAdmin: user.isSuperAdmin,
        permissions: [],  // Extend when Permission model is added
      },
      { deviceId, ipAddress, userAgent }
    );

    res.cookie(COOKIE_NAMES.SESSION, sessionCookie, SESSION_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH, refreshCookie, REFRESH_COOKIE_OPTIONS);

    const csrfToken = await generateCsrfToken(res);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ipAddress, failedLoginCount: 0 },
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
      },
      csrfToken,
    });

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: err.issues });
    }
    console.error('[LOGIN]', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============== POST /api/auth/refresh ==============

router.post('/refresh', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionCookie = req.cookies?.[COOKIE_NAMES.SESSION];
    const refreshCookie = req.cookies?.[COOKIE_NAMES.REFRESH];

    if (!sessionCookie || !refreshCookie) {
      return res.status(401).json({ error: 'No cookies' });
    }

    const currentSession = await sessionService.validateSession(sessionCookie);
    if (!currentSession) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const result = await sessionService.refreshSession(currentSession, refreshCookie);
    if (!result) {
      return res.status(401).json({ error: 'Cannot refresh' });
    }

    res.cookie(COOKIE_NAMES.SESSION, result.sessionCookie, SESSION_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH, result.refreshCookie, REFRESH_COOKIE_OPTIONS);

    const csrfToken = await generateCsrfToken(res);
    res.json({ success: true, csrfToken });
  } catch (err: any) {
    console.error('[REFRESH]', err);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

// ============== POST /api/auth/logout ==============

router.post('/logout', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    if (req.session) {
      await sessionService.destroySession(req.session.userId, req.session.deviceId);
    }
    clearAllAuthCookies(res);
    res.json({ success: true });
  } catch (err) {
    console.error('[LOGOUT]', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ============== POST /api/auth/logout-all ==============

router.post('/logout-all', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const count = await sessionService.destroyAllSessions(req.session!.userId);
    clearAllAuthCookies(res);
    res.json({ success: true, sessionsDestroyed: count });
  } catch (err) {
    res.status(500).json({ error: 'Logout all failed' });
  }
});

// ============== GET /api/auth/devices ==============

router.get('/devices', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const devices = await sessionService.getActiveDevices(req.session!.userId);
    const enriched = devices.map(d => ({ ...d, current: d.deviceId === req.session!.deviceId }));
    res.json({ devices: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list devices' });
  }
});

// ============== DELETE /api/auth/devices/:deviceId ==============

router.delete('/devices/:deviceId', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { deviceId } = req.params;
    if (deviceId === req.session!.deviceId) {
      return res.status(400).json({ error: 'Use /logout for current device' });
    }
    await sessionService.destroySession(req.session!.userId, deviceId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

// ============== GET /api/auth/csrf ==============

router.get('/csrf', async (req: Request, res: Response) => {
  const token = await generateCsrfToken(res);
  res.json({ token });
});

// ============== GET /api/auth/me ==============

router.get('/me', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session!.userId },
      include: { organization: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.name,
        name: user.name,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
      },
      subscription: {
        // Organization schema has no subscription fields yet.
        // Extend when billing is wired to org.
        status: 'active',
        plan: 'pro',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
