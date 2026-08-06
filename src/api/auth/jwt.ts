import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
);

export interface AccessTokenPayload {
  userId: string;
  organizationId: string | null;
  role: string;
  sessionId: string;
}

/** JWT Access token — 15 minutes, stocké en mémoire uniquement (jamais localStorage) */
export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer('bizos.app')
    .setAudience('bizos-web')
    .setExpirationTime('15m')
    .setSubject(payload.userId)
    .setJti(crypto.randomUUID())
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer: 'bizos.app',
    audience: 'bizos-web',
  });
  return payload as unknown as AccessTokenPayload;
}
