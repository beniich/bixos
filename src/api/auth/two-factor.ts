import { PrismaClient } from '@prisma/client';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';
import argon2 from 'argon2';
import { encryptSecret, decryptSecret } from './password';
import { auditLog } from './audit';

const prisma = new PrismaClient();
const ISSUER = 'BizOS';
const BACKUP_CODES_COUNT = 10;

interface TwoFactorSetup {
  secret: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

/** Initialise la config 2FA TOTP pour un utilisateur */
export async function initiate2FASetup(userId: string, userEmail: string): Promise<TwoFactorSetup> {
  const secret = new OTPAuth.Secret({ size: 32 });
  const encryptedSecret = encryptSecret(secret.base32);

  // Générer 10 codes de secours aléatoires
  const backupCodes = Array.from({ length: BACKUP_CODES_COUNT }, () =>
    generateBackupCode()
  );
  const hashedBackupCodes = await Promise.all(
    backupCodes.map(code => argon2.hash(code, { type: argon2.argon2id, memoryCost: 2 ** 14 }))
  );

  // Supprimer une configuration existante non activée
  await prisma.twoFactorSecret.deleteMany({ where: { userId } });

  await prisma.twoFactorSecret.create({
    data: {
      userId,
      method: 'TOTP',
      secretEncrypted: encryptedSecret,
      backupCodesHashed: hashedBackupCodes,
    },
  });

  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret
  });

  const qrCodeDataUrl = await QRCode.toDataURL(totp.toString());

  return { secret: secret.base32, qrCodeDataUrl, backupCodes };
}

/** Vérifie un code TOTP ou code de secours */
export async function verify2FACode(
  userId: string,
  token: string,
): Promise<{ verified: boolean; isBackupCode: boolean }> {
  const record = await prisma.twoFactorSecret.findUnique({ where: { userId } });
  if (!record) return { verified: false, isBackupCode: false };

  // 1. Vérifier TOTP
  const secretBase32 = decryptSecret(record.secretEncrypted);
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32)
  });

  if (totp.validate({ token, window: 1 }) !== null) {
    await prisma.twoFactorSecret.update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    });
    return { verified: true, isBackupCode: false };
  }

  // 2. Vérifier codes de secours
  for (let i = 0; i < record.backupCodesHashed.length; i++) {
    const hash = record.backupCodesHashed[i];
    if (await argon2.verify(hash, token)) {
      // Marquer le code comme utilisé (le retirer de la liste)
      const remaining = [...record.backupCodesHashed];
      remaining.splice(i, 1);
      await prisma.twoFactorSecret.update({
        where: { id: record.id },
        data: { backupCodesHashed: remaining, lastUsedAt: new Date() },
      });
      await auditLog({ eventType: 'BACKUP_CODE_USED', userId, success: true });
      return { verified: true, isBackupCode: true };
    }
  }

  return { verified: false, isBackupCode: false };
}

/** Active le 2FA après vérification du premier code */
export async function enable2FA(userId: string, verificationToken: string): Promise<void> {
  const result = await verify2FACode(userId, verificationToken);
  if (!result.verified) throw new Error('INVALID_2FA_TOKEN');

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true },
  });
  await prisma.twoFactorSecret.updateMany({
    where: { userId },
    data: { enabledAt: new Date() },
  });
  await auditLog({ eventType: 'TWO_FA_ENABLED', userId, success: true });
}

/** Désactive le 2FA (nécessite token TOTP + mot de passe) */
export async function disable2FA(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false },
  });
  await prisma.twoFactorSecret.deleteMany({ where: { userId } });
  await auditLog({ eventType: 'TWO_FA_DISABLED', userId, success: true });
}

function generateBackupCode(): string {
  // Format XXXXX-XXXXX lisible (sans 0/O/I/1 ambigus)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[crypto.randomInt(0, chars.length)]).join('');
  return `${part(5)}-${part(5)}`;
}
