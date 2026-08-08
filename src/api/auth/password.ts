import * as argon2 from 'argon2';
import crypto from 'crypto';

// ===== ARGON2ID — OWASP recommended =====
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS) as Promise<string>;
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

// ===== PASSWORD POLICY =====

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG';
}

const BLOCKLIST = new Set([
  'password', 'password123', '123456789', '12345678', '1234567890',
  'qwerty', 'qwerty123', 'abc123', 'letmein', 'welcome', 'admin',
  'iloveyou', 'monkey', 'dragon', 'sunshine', 'princess', 'football',
  'azerty', 'azertyuiop', 'motdepasse', 'soleil', 'bonjour',
]);

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length < 12) {
    errors.push('12 caractères minimum');
  }
  if (password.length > 128) {
    errors.push('128 caractères maximum');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins 1 majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins 1 minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Au moins 1 chiffre');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Au moins 1 caractère spécial (!@#$%^&*)');
  }
  if (/\s/.test(password)) {
    errors.push('Pas d\'espaces autorisés');
  }
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Trop de caractères répétés consécutivement');
  }
  if (BLOCKLIST.has(password.toLowerCase())) {
    errors.push('Mot de passe trop commun');
  }
  if (hasSequentialChars(password)) {
    errors.push('Évitez les séquences (1234, abcd, qwerty)');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: calcStrength(password),
  };
}

function hasSequentialChars(password: string): boolean {
  const sequences = [
    '0123456789', 'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    'azertyuiop',
  ];
  const lower = password.toLowerCase();
  return sequences.some(seq => {
    for (let i = 0; i <= seq.length - 4; i++) {
      if (lower.includes(seq.substring(i, i + 4))) return true;
    }
    return false;
  });
}

function calcStrength(password: string): PasswordValidationResult['strength'] {
  let score = 0;
  if (password.length >= 12) score += 2;
  if (password.length >= 16) score += 2;
  if (password.length >= 20) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 2;
  const unique = new Set(password).size;
  if (unique >= 8) score += 1;
  if (unique >= 12) score += 1;

  if (score < 5) return 'WEAK';
  if (score < 7) return 'FAIR';
  if (score < 9) return 'GOOD';
  return 'STRONG';
}

// ===== TOKEN UTILITIES =====

/** Token opaque sécurisé (refresh token, reset, verify) */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** Hash SHA-256 d'un token opaque (pour stockage DB) */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Chiffrement AES-256-GCM (pour secrets TOTP) */
export function encryptSecret(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptSecret(encrypted: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  const [ivHex, tagHex, data] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
