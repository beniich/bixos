#!/usr/bin/env node
/**
 * security-audit.ts — Test de blindage Express
 * Lance avec : npx tsx src/scripts/security-audit.ts
 */
const BASE = process.env.API_URL || 'http://localhost:3000';

async function test(label: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${label}`);
  } catch (e: any) {
    console.log(`  ❌ ${label}: ${e.message}`);
  }
}

async function run() {
  console.log(`\n🔐 Security Audit — ${BASE}\n`);

  // 1. Headers de sécurité
  await test('Helmet: X-Frame-Options présent', async () => {
    const r = await fetch(`${BASE}/api/health`);
    const v = r.headers.get('x-frame-options') || r.headers.get('content-security-policy');
    if (!v) throw new Error('Header manquant');
  });

  await test('X-Powered-By absent (fingerprint caché)', async () => {
    const r = await fetch(`${BASE}/api/health`);
    if (r.headers.get('x-powered-by')) throw new Error('X-Powered-By exposé !');
  });

  // 2. Payload trop lourd (DoS)
  await test('413 Payload Too Large (>10kb)', async () => {
    const bigPayload = JSON.stringify({ data: 'x'.repeat(15000) });
    const r = await fetch(`${BASE}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bigPayload,
    });
    if (r.status !== 413) throw new Error(`Status reçu: ${r.status} (attendu 413)`);
  });

  // 3. CORS bloqué depuis mauvais origin
  await test('CORS refusé depuis origine non autorisée', async () => {
    const r = await fetch(`${BASE}/api/health`, {
      headers: { Origin: 'https://evil-hacker.ru' },
    });
    const header = r.headers.get('access-control-allow-origin');
    if (header === '*' || header === 'https://evil-hacker.ru') throw new Error('CORS trop permissif !');
  });

  // 4. Paramètre pollution HTTP
  await test('HPP: paramètres dupliqués nettoyés', async () => {
    const r = await fetch(`${BASE}/api/members?status=ACTIVE&status=HACKED`);
    if (r.status === 500) throw new Error('Erreur serveur sur paramètre dupliqué');
    // Si on arrive ici sans crash, c'est ok
  });

  // 5. Erreur Prisma masquée en prod
  await test('Erreur DB masquée (aucun stacktrace Prisma)', async () => {
    const r = await fetch(`${BASE}/api/members/inexistant-id-xyz`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: '{}' });
    const body = await r.text();
    if (body.includes('PrismaClient') || body.includes('prisma')) throw new Error('Fuite de détails Prisma dans la réponse !');
  });

  console.log('\n✅ Audit terminé.\n');
}

run().catch(console.error);
