import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Returns the PostgreSQL connection string used by the app.
 *
 * `DATABASE_URL` is the canonical variable. Vercel's Prisma Postgres
 * integration may inject `POSTGRES_PRISMA_DATABASE_URL` or `POSTGRES_URL`
 * instead, so those are accepted as fallbacks.
 */
function getDatabaseUrl() {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_DATABASE_URL ??
    process.env.POSTGRES_URL;

  if (!url || !/^postgres(?:ql)?:\/\//i.test(url)) {
    throw new Error(
      'Configure DATABASE_URL with a PostgreSQL connection string.'
    );
  }

  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: getDatabaseUrl(),
      }),
      log: ['error'],
    } as never);
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
