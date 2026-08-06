import { PrismaClient, AuthEventType } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditLogInput {
  eventType: AuthEventType;
  userId?: string;
  organizationId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  geoCountry?: string;
  success?: boolean;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

/** Journalise chaque événement d'authentification en base de données */
export async function auditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.authAuditLog.create({
      data: {
        eventType: input.eventType,
        userId: input.userId,
        organizationId: input.organizationId,
        email: input.email,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        geoCountry: input.geoCountry,
        success: input.success,
        failureReason: input.failureReason,
        metadata: input.metadata as any,
      },
    });
  } catch (err) {
    // Ne jamais bloquer le flow pour une erreur d'audit
    console.error('[AuditLog] Failed to write audit log:', err);
  }
}
