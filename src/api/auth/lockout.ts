import { PrismaClient } from '@prisma/client';
import { auditLog } from './audit';

const prisma = new PrismaClient();

// Politique de verrouillage
const LOCKOUT_RULES = [
  { attempts: 5,  lockMinutes: 15 },
  { attempts: 10, lockMinutes: 60 },
  { attempts: 20, lockMinutes: 24 * 60 }, // 24h
];

interface LockoutStatus {
  locked: boolean;
  until?: Date;
  failedAttempts?: number;
}

/** Vérifie si un email/IP est actuellement verrouillé */
export async function checkLockout(email: string, ipAddress: string): Promise<LockoutStatus> {
  const now = new Date();

  const lockout = await prisma.accountLockout.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { ipAddress },
      ],
      expiresAt: { gt: now },
      unlockedAt: null,
    },
    orderBy: { expiresAt: 'desc' },
  });

  if (lockout) {
    return { locked: true, until: lockout.expiresAt };
  }

  return { locked: false };
}

/** Enregistre une tentative de connexion échouée et applique le lockout si nécessaire */
export async function recordFailedAttempt(input: {
  userId?: string;
  email: string;
  ipAddress: string;
  userAgent?: string;
  failureReason: string;
}): Promise<void> {
  const email = input.email.toLowerCase();
  const windowStart = new Date(Date.now() - 15 * 60 * 1000); // 15min window

  // Enregistrer la tentative
  await prisma.loginAttempt.create({
    data: {
      userId: input.userId,
      email,
      ipAddress: input.ipAddress,
      success: false,
      failureReason: input.failureReason,
      userAgent: input.userAgent,
    },
  });

  // Compter les échecs récents par email
  const recentFailures = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      attemptedAt: { gte: windowStart },
    },
  });

  // Appliquer la règle de lockout correspondante
  for (const rule of [...LOCKOUT_RULES].reverse()) {
    if (recentFailures >= rule.attempts) {
      const expiresAt = new Date(Date.now() + rule.lockMinutes * 60 * 1000);

      // Créer un verrou si pas déjà actif
      const existingLock = await prisma.accountLockout.findFirst({
        where: {
          email,
          expiresAt: { gt: new Date() },
          unlockedAt: null,
        },
      });

      if (!existingLock) {
        await prisma.accountLockout.create({
          data: {
            userId: input.userId,
            email,
            ipAddress: input.ipAddress,
            reason: 'too_many_failed_logins',
            expiresAt,
          },
        });

        await auditLog({
          eventType: 'ACCOUNT_LOCKED',
          userId: input.userId,
          email,
          ipAddress: input.ipAddress,
          success: false,
          metadata: {
            attempts: recentFailures,
            lockMinutes: rule.lockMinutes,
            expiresAt: expiresAt.toISOString(),
          },
        });
      }
      break;
    }
  }

  // Mettre à jour compteur utilisateur
  if (input.userId) {
    await prisma.user.update({
      where: { id: input.userId },
      data: {
        failedLoginCount: { increment: 1 },
        failedLoginAt: new Date(),
      },
    });
  }
}

/** Réinitialise les tentatives échouées après un login réussi */
export async function resetFailedAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      failedLoginAt: null,
      lockedUntil: null,
    },
  });
}

/** Nombre de tentatives échouées récentes pour une IP */
export async function getRecentFailuresByIp(ipAddress: string): Promise<number> {
  const windowStart = new Date(Date.now() - 15 * 60 * 1000);
  return prisma.loginAttempt.count({
    where: {
      ipAddress,
      success: false,
      attemptedAt: { gte: windowStart },
    },
  });
}
