import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

// Prisma + D1
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

type Bindings = {
  DB: D1Database;
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

// Export default for Cloudflare Workers
export default app;
