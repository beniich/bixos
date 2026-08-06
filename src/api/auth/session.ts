import { PrismaClient, SessionStatus } from '@prisma/client';
import crypto from 'crypto';
import { generateSecureToken, hashToken } from './password';
import { signAccessToken } from './jwt';
import { auditLog } from './audit';

const prisma = new PrismaClient();

const REFRESH_TTL_DEFAULT = 7 * 24 * 60 * 60 * 1000;   // 7 jours
const REFRESH_TTL_REMEMBER = 30 * 24 * 60 * 60 * 1000; // 30 jours
const IDLE_TIMEOUT = 24 * 60 * 60 * 1000;               // 24h sans activité

interface CreateSessionInput {
  userId: string;
  organizationId: string | null;
  role: string;
  ipAddress: string;
  userAgent: string;
  rememberMe?: boolean;
}

interface SessionResult {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: Date;
}

export async function createSession(input: CreateSessionInput): Promise<SessionResult> {
  const refreshToken = generateSecureToken(32);
  const refreshTokenHash = hashToken(refreshToken);
  const userAgentHash = hashToken(input.userAgent);

  const ttl = input.rememberMe ? REFRESH_TTL_REMEMBER : REFRESH_TTL_DEFAULT;
  const expiresAt = new Date(Date.now() + ttl);

  const session = await prisma.session.create({
    data: {
      userId: input.userId,
      refreshTokenHash,
      userAgentHash,
      ipAddress: input.ipAddress,
      expiresAt,
      lastUsedAt: new Date(),
    },
  });

  const accessToken = await signAccessToken({
    userId: input.userId,
    organizationId: input.organizationId,
    role: input.role,
    sessionId: session.id,
  });

  return {
    sessionId: session.id,
    accessToken,
    refreshToken,
    refreshTokenExpiry: expiresAt,
  };
}

/** Rotation du refresh token — invalide l'ancien et émet un nouveau */
export async function rotateRefreshToken(
  oldRefreshToken: string,
  ipAddress: string,
  userAgent: string,
): Promise<{ accessToken: string; newRefreshToken: string; sessionId: string }> {
  const tokenHash = hashToken(oldRefreshToken);

  const session = await prisma.session.findFirst({
    where: {
      refreshTokenHash: tokenHash,
      status: SessionStatus.ACTIVE,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) {
    // Token invalide ou réutilisé : invalider toutes les sessions de l'utilisateur
    // On ne peut pas identifier l'utilisateur directement, donc on log seulement
    await auditLog({
      eventType: 'SUSPICIOUS_ACTIVITY',
      ipAddress,
      success: false,
      failureReason: 'REFRESH_TOKEN_REUSE_OR_INVALID',
    });
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // Vérifier l'idle timeout
  const idleMs = Date.now() - session.lastUsedAt.getTime();
  if (idleMs > IDLE_TIMEOUT) {
    await prisma.session.update({
      where: { id: session.id },
      data: { status: SessionStatus.EXPIRED },
    });
    throw new Error('SESSION_IDLE_TIMEOUT');
  }

  // Générer nouveau refresh token
  const newRefreshToken = generateSecureToken(32);
  const newRefreshTokenHash = hashToken(newRefreshToken);

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      lastUsedAt: new Date(),
      ipAddress,
      userAgentHash: hashToken(userAgent),
    },
  });

  const accessToken = await signAccessToken({
    userId: session.userId,
    organizationId: session.user.organizationId,
    role: session.user.role,
    sessionId: session.id,
  });

  return { accessToken, newRefreshToken, sessionId: session.id };
}

export async function revokeSession(sessionId: string, userId: string, reason = 'user_action'): Promise<void> {
  await prisma.session.updateMany({
    where: { id: sessionId, userId },
    data: { status: SessionStatus.REVOKED, revokedAt: new Date(), revokedReason: reason },
  });
  await auditLog({ eventType: 'SESSION_REVOKED', userId, success: true, metadata: { sessionId, reason } });
}

export async function revokeAllUserSessions(userId: string, reason = 'security'): Promise<void> {
  const count = await prisma.session.updateMany({
    where: { userId, status: SessionStatus.ACTIVE },
    data: { status: SessionStatus.REVOKED, revokedAt: new Date(), revokedReason: reason },
  });
  await auditLog({ eventType: 'SESSIONS_REVOKED_ALL', userId, success: true, metadata: { count: count.count, reason } });
}

export async function getUserActiveSessions(userId: string) {
  return prisma.session.findMany({
    where: {
      userId,
      status: SessionStatus.ACTIVE,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      ipAddress: true,
      geoCountry: true,
      deviceType: true,
      issuedAt: true,
      lastUsedAt: true,
      expiresAt: true,
    },
    orderBy: { lastUsedAt: 'desc' },
  });
}
