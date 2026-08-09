import express, { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../auth/jwt';
import { notificationService } from './service';

const router = express.Router();

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

router.post('/mark-as-read', express.json(), requireAuth, async (req, res) => {
  try {
    const { notifId } = req.body;
    const orgId = (req as any).orgId;
    const userId = (req as any).uid;

    if (!notifId) return res.status(400).json({ error: 'notifId manquant' });

    await notificationService.markAsRead(orgId, userId, notifId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/mark-all-as-read', express.json(), requireAuth, async (req, res) => {
  try {
    const orgId = (req as any).orgId;
    const userId = (req as any).uid;

    await notificationService.markAllAsRead(orgId, userId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
