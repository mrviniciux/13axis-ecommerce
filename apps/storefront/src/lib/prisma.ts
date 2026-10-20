import { getConnectionString } from '@netlify/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export type DatabaseProvider = 'mysql' | 'postgresql';

/**
 * The Prisma Client is generated for a single provider at a time.
 * Keep the selection in one place so the app, seed, and scripts agree.
 */
export function getDatabaseProvider(): DatabaseProvider {
  const explicit = process.env.DATABASE_PROVIDER?.trim().toLowerCase();
  if (explicit === 'postgres' || explicit === 'postgresql') return 'postgresql';
  if (explicit === 'mysql') return 'mysql';

  const url = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL ?? '';
  return /^postgres(?:ql)?:\/\//i.test(url) ? 'postgresql' : 'mysql';
}

function postgresConnectionString() {
  const configured = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL;
  if (configured && /^postgres(?:ql)?:\/\//i.test(configured)) {
    return configured;
  }

  // Netlify injects NETLIFY_DB_URL at build/runtime. This helper also works
  // with the Netlify CLI and local Netlify Database sessions.
  return getConnectionString();
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma =
      getDatabaseProvider() === 'postgresql'
        ? new PrismaClient({
            adapter: new PrismaPg({
              connectionString: postgresConnectionString(),
            }),
            log: ['error'],
          } as never)
        : new PrismaClient({ log: ['error'] });
  }

  return globalForPrisma.prisma;
}

// Delay connection setup until a request, rather than during Next.js compilation.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrisma();
    const value = Reflect.get(client, property);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
