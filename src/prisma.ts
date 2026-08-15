import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/bizos?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
