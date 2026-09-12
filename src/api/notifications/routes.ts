import { Hono } from 'hono';
import { requireAuthHono } from '../auth/middleware';
import { notificationService } from './service';

const notificationsRouter = new Hono<{ Variables: { prisma: any, session: any } }>();

notificationsRouter.post('/mark-as-read', requireAuthHono, async (c) => {
  try {
    const prisma = c.get('prisma');
    const session = c.get('session');
    const { notifId } = await c.req.json();
    
    const orgId = session.organizationId;
    const userId = session.userId;

    if (!notifId) return c.json({ error: 'notifId manquant' }, 400);

    await notificationService.markAsRead(orgId, userId, notifId, prisma);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

notificationsRouter.post('/mark-all-as-read', requireAuthHono, async (c) => {
  try {
    const prisma = c.get('prisma');
    const session = c.get('session');
    
    const orgId = session.organizationId;
    const userId = session.userId;

    await notificationService.markAllAsRead(orgId, userId, prisma);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default notificationsRouter;
