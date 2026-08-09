/**
 * Routes Stripe — /api/billing/*
 * 
 * - POST /api/billing/checkout  → Crée une Checkout Session
 * - POST /api/billing/portal    → Ouvre le Customer Portal Stripe
 * - POST /api/billing/webhook   → Reçoit les événements Stripe (BODY RAW requis)
 */
import express, { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../auth/jwt';
import { createCheckoutSession, createPortalSession } from './checkout';
import { handleStripeWebhook } from './webhook';

const router = express.Router();

// ======= Middleware Auth JWT =======
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token) as any;
    (req as any).uid   = payload.sub || payload.uid;
    (req as any).orgId = payload.orgId;
    (req as any).role  = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// ======= POST /api/billing/checkout =======
// Crée une session de paiement Stripe et retourne l'URL de redirection
router.post('/checkout', express.json(), requireAuth, (req, res) => createCheckoutSession(req, res));

// ======= POST /api/billing/portal =======
// Ouvre le portail Stripe pour gérer l'abonnement (cancel, update CB, invoices…)
router.post('/portal', express.json(), requireAuth, (req, res) => createPortalSession(req, res));

// ======= POST /api/billing/webhook =======
// ⚠️ CRITIQUE : Ce endpoint reçoit le body RAW (Buffer), pas en JSON.
// La vérification de signature Stripe nécessite le body brut.
// Doit être enregistré AVANT express.json() dans server.ts
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => handleStripeWebhook(req, res)
);

// ======= GET /api/billing/status =======
// Retourne l'état de l'abonnement de l'organisation (depuis Firestore via auth)
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { adminDb } = await import('../../firebase/firebaseAdmin');
    const orgId = (req as any).orgId;
    if (!orgId) return res.status(400).json({ error: 'orgId manquant' });

    const orgSnap = await adminDb.collection('organizations').doc(orgId).get();
    if (!orgSnap.exists) return res.status(404).json({ error: 'Organisation introuvable' });

    const data = orgSnap.data()!;
    return res.status(200).json({
      subscriptionStatus: data.subscriptionStatus,
      plan:               data.plan,
      planExpiresAt:      data.planExpiresAt,
      trialEndsAt:        data.trialEndsAt,
      seatsIncluded:      data.seatsIncluded,
      seatsUsed:          data.seatsUsed,
      stripeCustomerId:   data.stripeCustomerId,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
