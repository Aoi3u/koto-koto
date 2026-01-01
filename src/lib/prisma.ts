import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Ensure a single PrismaClient instance on the server
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };

// Configure SSL at the Pool level only, not globally
const sslMode = process.env.DATABASE_SSL;
const allowSelfSigned = sslMode !== 'strict' && process.env.NODE_ENV !== 'production';
const sslConfig = sslMode === 'disable' ? false : { rejectUnauthorized: !allowSelfSigned };

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});
const adapter = new PrismaPg(pool);

export const prisma: PrismaClientType = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
