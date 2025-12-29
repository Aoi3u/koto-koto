import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Ensure a single PrismaClient instance on the server
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };

// 開発では自己署名をデフォルト許可。プロダクションや DATABASE_SSL=strict で厳格化。
const sslMode = process.env.DATABASE_SSL;
const allowSelfSigned = sslMode !== 'strict' && process.env.NODE_ENV !== 'production';
if (allowSelfSigned || process.env.ALLOW_SELF_SIGNED_CERT === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const sslConfig = sslMode === 'disable' ? false : { rejectUnauthorized: !allowSelfSigned };
pg.defaults.ssl = sslConfig;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});
const adapter = new PrismaPg(pool);

export const prisma: PrismaClientType = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
