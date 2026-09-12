import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

// Prisma + D1
import { PrismaClient } from './src/generated/prisma';
import { PrismaD1 } from '@prisma/adapter-d1';

// Routers
import authRouter from './src/api/auth/routes';
import stripeRouter from './src/api/stripe/routes';
import notificationsRouter from './src/api/notifications/routes';

type Bindings = {
  DB: D1Database;
  ASSETS: { fetch: typeof fetch };
};

const app = new Hono<{ Bindings: Bindings }>();

// Security middlewares
app.use('*', secureHeaders());
app.use('*', cors({
  origin: (origin) => {
    // Implement allowed origins logic
    return origin;
  },
  credentials: true,
}));

// Provide Prisma in context
app.use('*', async (c, next) => {
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  c.set('prisma', prisma);
  await next();
});

// Basic health check route
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', environment: 'Cloudflare Workers (Hono + D1)' });
});

// Mount modules
app.route('/api/auth', authRouter as any);
app.route('/api/billing', stripeRouter as any);
app.route('/api/notifications', notificationsRouter as any);

// SPA Routing: Pour toutes les requêtes GET qui ne sont pas des API, 
// on renvoie l'index.html de l'application React pour laisser le routeur client gérer la page.
app.get('*', async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.notFound();
  }
  // Renvoie index.html depuis les assets statiques
  const url = new URL(c.req.url);
  url.pathname = '/';
  return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
});

// Export default for Cloudflare Workers
export default app;
