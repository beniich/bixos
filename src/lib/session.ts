import { sealData, unsealData } from 'iron-session';
import { redis } from './upstash';
import { prisma } from '../prisma';

const SESSION_PASSWORD = process.env.SESSION_PASSWORD!;
if (!SESSION_PASSWORD) throw new Error('❌ SESSION_PASSWORD missing in .env');

const SESSION_TTL = 60 * 60 * 24 * 7;       // 7 jours
const REFRESH_TTL = 60 * 60 * 24 * 30;      // 30 jours

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
  displayName: string;
  isSuperAdmin: boolean;
  permissions: string[];
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
  lastActivityAt: number;
}

interface RefreshData {
  userId: string;
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
}

class SessionService {

  async createSession(
    user: {
      id: string;
      email: string;
      role: string;
      organizationId: string | null;
      displayName: string;
      isSuperAdmin: boolean;
      permissions: string[];
    },
    meta: { deviceId: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ sessionCookie: string; refreshCookie: string }> {
    const now = Date.now();
    const expiresAt = now + SESSION_TTL * 1000;

    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ?? '',
      displayName: user.displayName,
      isSuperAdmin: user.isSuperAdmin,
      permissions: user.permissions,
      deviceId: meta.deviceId,
      issuedAt: now,
      expiresAt,
      lastActivityAt: now,
    };

    const sessionCookie = await sealData(sessionData, {
      password: SESSION_PASSWORD,
      ttl: SESSION_TTL,
    });

    const refreshData: RefreshData = {
      userId: user.id,
      deviceId: meta.deviceId,
      issuedAt: now,
      expiresAt: now + REFRESH_TTL * 1000,
    };

    const refreshCookie = await sealData(refreshData, {
      password: SESSION_PASSWORD,
      ttl: REFRESH_TTL,
    });

    await this.storeInRedis(sessionData, meta);

    return { sessionCookie, refreshCookie };
  }

  private async storeInRedis(session: SessionData, meta: any) {
    const key = `session:${session.userId}:${session.deviceId}`;
    const pipeline = redis.pipeline();
    pipeline.setex(key, SESSION_TTL, JSON.stringify({ ...session, ...meta }));
    pipeline.sadd(`user:${session.userId}:devices`, session.deviceId);
    pipeline.expire(`user:${session.userId}:devices`, REFRESH_TTL);
    pipeline.incr('metrics:sessions:total');
    if (session.organizationId) {
      pipeline.incr(`metrics:sessions:org:${session.organizationId}`);
    }
    const today = new Date().toISOString().split('T')[0];
    pipeline.incr(`metrics:sessions:daily:${today}`);
    pipeline.expire(`metrics:sessions:daily:${today}`, 60 * 60 * 24 * 60);
    await pipeline.exec();
  }

  async validateSession(encryptedCookie: string): Promise<SessionData | null> {
    if (!encryptedCookie) return null;
    try {
      const session = await unsealData<SessionData>(encryptedCookie, {
        password: SESSION_PASSWORD,
      });

      if (session.expiresAt < Date.now()) {
        await this.destroySession(session.userId, session.deviceId);
        return null;
      }

      const key = `session:${session.userId}:${session.deviceId}`;
      const stored = await redis.get(key);
      if (!stored) return null;

      // Sliding expiration
      session.lastActivityAt = Date.now();
      await redis.setex(key, SESSION_TTL, JSON.stringify({
        ...(typeof stored === 'string' ? JSON.parse(stored) : stored),
        lastActivityAt: Date.now(),
      }));

      return session;
    } catch (err) {
      console.error('[SESSION] Invalid cookie:', err);
      return null;
    }
  }

  async refreshSession(
    oldSession: SessionData,
    encryptedRefresh: string
  ): Promise<{ sessionCookie: string; refreshCookie: string } | null> {
    try {
      const refreshData = await unsealData<RefreshData>(encryptedRefresh, {
        password: SESSION_PASSWORD,
      });

      if (
        refreshData.userId !== oldSession.userId ||
        refreshData.deviceId !== oldSession.deviceId
      ) return null;

      if (refreshData.expiresAt < Date.now()) return null;

      // Re-fetch user from Prisma to get latest role
      const user = await prisma.user.findUnique({
        where: { id: oldSession.userId },
      });

      if (!user) return null;

      return await this.createSession(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          displayName: user.name,
          isSuperAdmin: user.isSuperAdmin,
          permissions: oldSession.permissions,
        },
        { deviceId: oldSession.deviceId }
      );
    } catch (err) {
      console.error('[SESSION] Refresh failed:', err);
      return null;
    }
  }

  async destroySession(userId: string, deviceId: string): Promise<void> {
    await redis.pipeline()
      .del(`session:${userId}:${deviceId}`)
      .srem(`user:${userId}:devices`, deviceId)
      .exec();
  }

  async destroyAllSessions(userId: string): Promise<number> {
    const devices = await redis.smembers(`user:${userId}:devices`);
    if (devices.length === 0) return 0;
    const pipeline = redis.pipeline();
    devices.forEach(d => pipeline.del(`session:${userId}:${d}`));
    pipeline.del(`user:${userId}:devices`);
    await pipeline.exec();
    return devices.length;
  }

  async getActiveDevices(userId: string): Promise<Array<{
    deviceId: string;
    lastActivityAt: number;
    ipAddress?: string;
    userAgent?: string;
    current?: boolean;
  }>> {
    const devices = await redis.smembers(`user:${userId}:devices`);
    if (devices.length === 0) return [];
    const pipeline = redis.pipeline();
    devices.forEach(d => pipeline.get(`session:${userId}:${d}`));
    const results = await pipeline.exec();
    return devices.map((deviceId, i) => {
      const raw = results?.[i];
      if (!raw) return null;
      const s = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return { deviceId, lastActivityAt: s.lastActivityAt, ipAddress: s.ipAddress, userAgent: s.userAgent };
    }).filter(Boolean) as any;
  }
}

export const sessionService = new SessionService();
