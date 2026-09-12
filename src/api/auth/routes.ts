import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sessionService } from '../../lib/session';
import { generateCsrfToken } from '../../lib/csrf';
import { COOKIE_NAMES, SESSION_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS, clearAllAuthCookies } from '../../lib/cookies';
import { requireAuthHono } from './middleware';

// Hono App with contextual Prisma & Session
const auth = new Hono<{ Variables: { prisma: any, session: any } }>();

// ============== SCHEMAS ==============
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceId: z.string().min(1),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Le mot de passe doit contenir au moins 12 caractères'),
  name: z.string().min(2),
  deviceId: z.string().min(1),
});

// ============== POST /api/auth/register ==============
auth.post('/register', zValidator('json', RegisterSchema), async (c) => {
  const prisma = c.get('prisma');
  const { email, password, name, deviceId } = c.req.valid('json');

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return c.json({ error: 'Email already in use', code: 'EMAIL_TAKEN' }, 409);
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

  const ipAddress = c.req.header('cf-connecting-ip') ?? 'unknown';
  const userAgent = c.req.header('user-agent') ?? 'unknown';

  const { sessionCookie, refreshCookie } = await sessionService.createSession(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ?? 'unassigned',
      displayName: user.name,
      isSuperAdmin: user.isSuperAdmin,
      permissions: [],
      subscriptionStatus: 'trial',
      subscriptionPlan: 'free',
    },
    { deviceId, ipAddress, userAgent }
  );

  setCookie(c, COOKIE_NAMES.SESSION, sessionCookie, SESSION_COOKIE_OPTIONS as any);
  setCookie(c, COOKIE_NAMES.REFRESH, refreshCookie, REFRESH_COOKIE_OPTIONS as any);

  // Remarque : generateCsrfToken nécessitera une adaptation pour retourner juste le token
  const csrfToken = await generateCsrfToken({} as any);

  return c.json({
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
  }, 201);
});


// ============== POST /api/auth/login ==============
auth.post('/login', zValidator('json', LoginSchema), async (c) => {
  const prisma = c.get('prisma');
  const { email, password, deviceId } = c.req.valid('json');

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { organization: true },
  });

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return c.json({
      error: 'Account locked',
      code: 'LOCKED',
      lockedUntil: user.lockedUntil,
    }, 403);
  }

  const ipAddress = c.req.header('cf-connecting-ip') ?? 'unknown';
  const userAgent = c.req.header('user-agent') ?? 'unknown';

  const { sessionCookie, refreshCookie } = await sessionService.createSession(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ?? 'unassigned',
      displayName: user.name,
      isSuperAdmin: user.isSuperAdmin,
      permissions: [],
    },
    { deviceId, ipAddress, userAgent }
  );

  setCookie(c, COOKIE_NAMES.SESSION, sessionCookie, SESSION_COOKIE_OPTIONS as any);
  setCookie(c, COOKIE_NAMES.REFRESH, refreshCookie, REFRESH_COOKIE_OPTIONS as any);

  const csrfToken = await generateCsrfToken({} as any);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), lastLoginIp: ipAddress, failedLoginCount: 0 },
  });

  return c.json({
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
});


// ============== POST /api/auth/refresh ==============
auth.post('/refresh', async (c) => {
  const prisma = c.get('prisma');
  const sessionCookie = getCookie(c, COOKIE_NAMES.SESSION);
  const refreshCookie = getCookie(c, COOKIE_NAMES.REFRESH);

  if (!sessionCookie || !refreshCookie) {
    return c.json({ error: 'No cookies' }, 401);
  }

  const currentSession = await sessionService.validateSession(sessionCookie);
  if (!currentSession) {
    return c.json({ error: 'Invalid session' }, 401);
  }

  // Adapter sessionService pour recevoir prisma au lieu de l'importer globalement
  const result = await sessionService.refreshSession(currentSession, refreshCookie, prisma);
  if (!result) {
    return c.json({ error: 'Cannot refresh' }, 401);
  }

  setCookie(c, COOKIE_NAMES.SESSION, result.sessionCookie, SESSION_COOKIE_OPTIONS as any);
  setCookie(c, COOKIE_NAMES.REFRESH, result.refreshCookie, REFRESH_COOKIE_OPTIONS as any);

  const csrfToken = await generateCsrfToken({} as any);
  return c.json({ success: true, csrfToken });
});


// ============== POST /api/auth/logout ==============
auth.post('/logout', requireAuthHono, async (c) => {
  const session = c.get('session');
  if (session) {
    await sessionService.destroySession(session.userId, session.deviceId);
  }
  // TODO: clearAllAuthCookies using setCookie
  return c.json({ success: true });
});


// ============== POST /api/auth/logout-all ==============
auth.post('/logout-all', requireAuthHono, async (c) => {
  const session = c.get('session');
  const count = await sessionService.destroyAllSessions(session.userId);
  return c.json({ success: true, sessionsDestroyed: count });
});


// ============== GET /api/auth/devices ==============
auth.get('/devices', requireAuthHono, async (c) => {
  const session = c.get('session');
  const devices = await sessionService.getActiveDevices(session.userId);
  const enriched = devices.map(d => ({ ...d, current: d.deviceId === session.deviceId }));
  return c.json({ devices: enriched });
});


// ============== DELETE /api/auth/devices/:deviceId ==============
auth.delete('/devices/:deviceId', requireAuthHono, async (c) => {
  const session = c.get('session');
  const deviceId = c.req.param('deviceId');
  
  if (deviceId === session.deviceId) {
    return c.json({ error: 'Use /logout for current device' }, 400);
  }
  await sessionService.destroySession(session.userId, deviceId);
  return c.json({ success: true });
});


// ============== GET /api/auth/csrf ==============
auth.get('/csrf', async (c) => {
  const token = await generateCsrfToken({} as any);
  return c.json({ token });
});


// ============== GET /api/auth/me ==============
auth.get('/me', requireAuthHono, async (c) => {
  const prisma = c.get('prisma');
  const session = c.get('session');
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { organization: true },
  });

  if (!user) return c.json({ error: 'User not found' }, 404);

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.name,
      name: user.name,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      organizationId: user.organizationId ?? 'unassigned',
      organizationName: user.organization?.name,
    },
    subscription: {
      status: (user.organization as any)?.plan === 'trial' ? 'trial' : 'active',
      plan: (user.organization as any)?.plan ?? 'free',
      expiresAt: (user.organization as any)?.planExpiresAt?.toISOString(),
    },
  });
});

export default auth;
