import { getConnectionString } from '@netlify/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrisma() {
  // Keep existing admin transactions and Auth.js models on the same managed
  // Postgres database used by the Drizzle storefront queries.
  return (globalForPrisma.prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: getConnectionString() }),
    log: ['error'],
  }));
}

// Delay connection setup until a request, rather than during Next.js compilation.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrisma();
    const value = Reflect.get(client, property);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
