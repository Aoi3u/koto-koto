import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Ensure a single PrismaClient instance on the server
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };

let prismaInstance: PrismaClientType | null = null;

// Lazily initialize Prisma to avoid build-time validation errors
function getPrismaClient(): PrismaClientType {
  if (prismaInstance) {
    return prismaInstance;
  }

  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
  }

  // Validate DATABASE_URL exists at runtime
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  // Configure SSL at the Pool level only, not globally
  const sslMode = process.env.DATABASE_SSL;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // For Supabase and other managed databases, accept self-signed certificates
  // Only enforce strict SSL validation if explicitly set to 'strict'
  const sslConfig = sslMode === 'disable' 
    ? false 
    : { rejectUnauthorized: sslMode === 'strict' };

  // Production-ready connection pool settings
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
    max: isProduction ? 10 : 5, // Max connections in pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection cannot be established
  });

  // Log connection errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  const adapter = new PrismaPg(pool);

  prismaInstance = new PrismaClient({
    adapter,
    log: isProduction ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
  });

  if (!isProduction) {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
}

// Export a Proxy that defers initialization until first access
export const prisma = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    const client = getPrismaClient();
    return client[prop as keyof PrismaClientType];
  },
});
